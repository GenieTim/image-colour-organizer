/* eslint-disable no-await-in-loop */
const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const ColorThief = require('colorthief')
const isImage = require('is-image')
const Jimp = require('jimp')

/**
 * Do a pseudo-foreach loop with an async callback
 *
 * @param {array} array The array to loop over
 * @param {callable} callback The async function to wait for
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

class IndexerCommand extends Command {
  /**
   * The main starting point
   */
  async run() {
    const {args, flags} = this.parse(IndexerCommand)
    this.debug = flags.debug

    // load "cache"
    let cacheFilePath = path.join(__dirname, '/../../../image-colour-export-cache.json')
    let alreadyProcessedFilePaths = []
    let alreadyProcessedFiles = []
    try {
      let alreadyProcessedFiles = JSON.parse(fs.readFileSync(cacheFilePath))
      for (let i = 0; i < alreadyProcessedFiles.length; ++i) {
        alreadyProcessedFilePaths.push(alreadyProcessedFiles[i].originalPath)
      }
    } catch (error) {
      // e.g. file does not exist (yet)
    }
    let initialProcessedFiles = alreadyProcessedFiles

    // walk directory and checkout each file
    let thisCommand = this
    let allFiles = await this.walkDirectory(args.path, flags.recurse, async function (filePath) {
      // ignore non-images
      // NOTE: e.g. .photoshop, .tif, not supported
      if (!isImage(filePath) || ['.tif', '.photoshop', '.psd'].includes(path.extname(filePath))) {
        thisCommand.possiblyLog('No image: ' + filePath)
        return
      }
      thisCommand.possiblyLog('Image found at: ' + filePath)

      if (alreadyProcessedFilePaths.includes(filePath)) {
        thisCommand.possiblyLog('Skipping ' + filePath + ' since it was found processed in cache')
        return
      }

      // determine the color palette
      let palette = {}
      try {
        palette = await ColorThief.getPalette(filePath, flags.colourCount)
      } catch (error) {
        thisCommand.log('Failed to detect colour palette for ' + filePath)
        thisCommand.error(error, {exit: false})
        // we just skip them with some log
        return
      }
      // resize file
      let resizedFiles = []
      try {
        resizedFiles = await thisCommand.resizeImageFile(args.path, filePath)
      } catch (error) {
        thisCommand.error(error, {exit: false})
      }

      // return a simple JSON object describing the found file
      let returnValue = {
        resizedImages: resizedFiles,
        originalPath: filePath,
        palette: palette,
      }

      // write cache every 25 files
      alreadyProcessedFiles.push(returnValue)
      if (alreadyProcessedFiles.length % 25 === 0) {
        try {
          fs.writeFileSync(cacheFilePath, JSON.stringify(alreadyProcessedFiles), {encoding: 'utf-8'})
        } catch (error) {
          thisCommand.possiblyLog(error)
        }
      }

      return returnValue
    })

    // write final file
    let targetFilePath = path.join(__dirname, '/../../../image-colour-export.json')

    let jsonToWrite = JSON.stringify(allFiles.concat(initialProcessedFiles))
    this.log('Writing to file: "' + targetFilePath + '", found ' + allFiles.length + ' files.')
    try {
      fs.writeFileSync(targetFilePath, jsonToWrite, {encoding: 'utf-8'})
    } catch (error) {
      this.log('Failed to write the following: ' + jsonToWrite)
      this.error(error, {exit: true})
    }
    this.exit(0)
  }

  async resizeImageFile(imageSourceDir, imageFile) {
    let relativeFilePath = path.relative(imageSourceDir, path.dirname(imageFile))
    let fileName = path.parse(path.basename(imageFile))
    const imageDestDir = path.resolve(__dirname, '../../../frontend/public/resized-images/')
    // check which sizes are needed at all based on the file mtime in order not read the file too eager
    let sizesToDo = []
    let targetFilePaths = []
    let sizes = [600, 300, 150]
    let files = {}
    for (let size of sizes) {
      let targetFileName = fileName.name + '-' + size + fileName.ext
      const targetFile = path.join(imageDestDir, relativeFilePath, targetFileName)
      files[size] = path.join(relativeFilePath, targetFileName)
      if (fs.existsSync(targetFile)) {
        // check mtime
        let statsOld = fs.statSync(imageFile)
        let statsNew = fs.statSync(targetFile)
        if (statsNew.mtime > statsOld.mtime) {
          // do not recompile if already exits & current
          continue
        } else {
          this.possiblyLog('Will generate again: "' + imageFile + '" is newer then "' + targetFile + '"')
        }
      } else {
        this.possiblyLog('File "' + targetFile + '" not found. Will generate...')
      }
      sizesToDo.push(size)
      targetFilePaths.push(targetFile)
    }

    // then, do the actual processing
    if (sizesToDo.length > 0) {
      // we do the loop over the sizes twice in order to read only the files we really need to
      let image
      try {
        image = await Jimp.read(imageFile)
      } catch (error) {
        this.error('Failed to read "' + imageFile + '". Error: ' + error, {exit: false})
        return files
      }
      for (let iSize = 0; iSize < sizesToDo.length; ++iSize) {
        // do not scale up, only down...
        // note that this leads to an overhead in time this script takes
        if (image.bitmap.height < sizesToDo[iSize] || image.bitmap.width < sizesToDo[iSize]) {
          continue
        }
        // clone
        let sizedImage = image
        try {
          await sizedImage.resize(sizesToDo[iSize], Jimp.AUTO)
          await sizedImage.quality(68)
          await sizedImage.writeAsync(targetFilePaths[iSize])
          this.possiblyLog('Output "' + targetFilePaths[iSize] + '" from "' + imageFile + '"')
        } catch (error) {
          this.error('Failed to write "' + targetFilePaths[iSize] + '" from "' + imageFile + '". Error: ' + error, {exit: false})
        }
      }
    }

    return files
  }

  /**
   * Walk a directory and call a function on each file/directory
   *
   * @param {string} directory The path where to start walking
   * @param {boolean} recursive Whether to recurse into directories or not
   * @param {callable} callbackOnFile The callback to call on files & directories
   */
  async walkDirectory(directory, recursive, callbackOnFile) {
    let returnValues = []
    let files = fs.readdirSync(directory)
    await asyncForEach(files, async file => {
      const filePath = path.join(directory, file)
      if (recursive) {
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          let newValues = await this.walkDirectory(filePath, recursive, callbackOnFile)
          returnValues = returnValues.concat(newValues)
        }
      }
      let returnValue = await callbackOnFile(filePath)
      if (returnValue) {
        returnValues.push(returnValue)
      }
    })
    return returnValues
  }

  possiblyLog(txt) {
    if (this.debug) {
      this.log(txt)
    }
  }
}

IndexerCommand.description = `Do the indexing of the images
...
This command resizes all images in the given path to a folder 
accessible by the frontend as well as saves a json file 
with the image paths and their colour palettes
`

IndexerCommand.args = [{
  name: 'path',
  required: true,
  description: 'The path to the image files to index',
}]

IndexerCommand.flags = {
  recurse: flags.boolean({char: 'r', description: 'whether to recurse into subdirectories', default: true}),
  colourCount: flags.integer({car: 'c', description: 'number of colours in the colour palette', default: 5}),
  debug: flags.boolean({char: 'd', description: 'Output information of processed files', default: false}),
}

module.exports = IndexerCommand
