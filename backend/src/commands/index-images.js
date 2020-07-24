const { Command, flags } = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const ColorThief = require('colorthief')
const isImage = require('is-image')

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
    const { args, flags } = this.parse(IndexerCommand)
    // walk directory and checkout each file
    let thisCommand = this
    let allFiles = await this.walkDirectory(args.path, flags.recurse, async function (filePath) {
      // ignore non-images
      // NOTE: e.g. .photoshop, .tif, not supported
      if (!isImage(filePath) || ['.tif', '.photoshop', '.psd'].includes(path.extname(filePath))) {
        thisCommand.log('No image: ' + filePath)
        return
      }
      thisCommand.log('Image found at: ' + filePath)
      // determine the color palette
      let palette = {}
      try {
        palette = await ColorThief.getPalette(filePath, flags.colourCount)
      } catch (error) {
        thisCommand.log('Failed to detect colour palette for ' + filePath)
        thisCommand.error(error, { exit: false })
        // we just skip them with some log
        return
      }
      // return a simple JSON object describing the found file
      return {
        path: filePath,
        palette: palette,
      }
    })

    // let targetFilePath = this.config.home + '/image-colours-' + Date.now() + '.json'
    let targetFilePath = path.join([__dirname, '/../../../image-colour-export.json'])
    let jsonToWrite = JSON.stringify(allFiles)
    // this.log('Going to write the following: ' + jsonToWrite)
    this.log('Writing to file: ' + targetFilePath + ', found ' + allFiles.length + ' files.')
    fs.writeFileSync(targetFilePath, jsonToWrite, { encoding: 'utf-8' })
    this.exit(0)
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
}

IndexerCommand.description = `Do the indexing of the images
...
Saves a json file with the image paths and their colour palettes
`

IndexerCommand.args = [{
  name: 'path',
  required: true,
  description: 'The path to the image files to index',
}]

IndexerCommand.flags = {
  recurse: flags.boolean({ char: 'r', description: 'whether to recurse into subdirectories', default: true }),
  colourCount: flags.integer({ car: 'c', description: 'number of colours in the colour palette', default: 5 }),
}

module.exports = IndexerCommand
