const {Command, flags } = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const ColorThief = require('colorthief')

class IndexerCommand extends Command {
  async run() {
    const {args, flags} = this.parse(IndexerCommand)

    // initialize return
    var allFiles = []
    // walk directory
    await this.walkDirectory(args.path, flags.recurse, async function (filePath) {
      let palette = {}
      try {
        palette = await ColorThief.getPalette(filePath, flags.colourCount)
      } catch (error) {
        this.error(error)
        return
      }
      allFiles.push({
        path: filePath,
        palette: palette,
      })
    })

    let targetFilePath = this.config.home + '/image-colours-' + Date.now() + '.json'
    this.log('Writing to file: ' + targetFilePath)
    return fs.writeFile(targetFilePath, JSON.stringify(allFiles), {encoding: 'utf-8'})
  }

  async walkDirectory(directory, recursive, callbackOnFile) {
    let files = await fs.readdir(directory)
    let returns = await Promise.all(files.map(async file => {
      const filePath = path.join(directory, file)
      if (recursive) {
        const stats = await fs.stat(filePath)
        if (stats.isDirectory()) {
          return this.walkDirectory(filePath)
        }
      }
      return callbackOnFile(filePath)
    }))

    return returns
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
  recurse: flags.boolean({char: 'r', description: 'whether to recurse into subdirectories', default: true}),
  colourCount: flags.integer({car: 'c', description: 'number of colours in the colour palette', default: 5}),
}

module.exports = IndexerCommand
