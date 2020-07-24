image-colour-organizer
======================

An indexer of photos/images and especially their colour

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/image-colour-organizer.svg)](https://npmjs.org/package/image-colour-organizer)
[![Downloads/week](https://img.shields.io/npm/dw/image-colour-organizer.svg)](https://npmjs.org/package/image-colour-organizer)
[![License](https://img.shields.io/npm/l/image-colour-organizer.svg)](https://github.com/GenieTim/image-colour-organizer/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g image-colour-organizer
$ image-colour-organizer COMMAND
running command...
$ image-colour-organizer (-v|--version|version)
image-colour-organizer/0.0.0 darwin-x64 node-v12.18.1
$ image-colour-organizer --help [COMMAND]
USAGE
  $ image-colour-organizer COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`image-colour-organizer hello`](#image-colour-organizer-hello)
* [`image-colour-organizer help [COMMAND]`](#image-colour-organizer-help-command)
* [`image-colour-organizer index-images PATH`](#image-colour-organizer-index-images-path)

## `image-colour-organizer hello`

Describe the command here

```
USAGE
  $ image-colour-organizer hello

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/hello.js](https://github.com/GenieTim/image-colour-organizer/blob/v0.0.0/src/commands/hello.js)_

## `image-colour-organizer help [COMMAND]`

display help for image-colour-organizer

```
USAGE
  $ image-colour-organizer help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `image-colour-organizer index-images PATH`

Do the indexing of the images

```
USAGE
  $ image-colour-organizer index-images PATH

ARGUMENTS
  PATH  The path to the image files to index

OPTIONS
  -r, --recurse              whether to recurse into subdirectories
  --colourCount=colourCount  [default: 5] number of colours in the colour palette

DESCRIPTION
  ...
  Saves a json file with the image paths and their colour palettes
```

_See code: [src/commands/index-images.js](https://github.com/GenieTim/image-colour-organizer/blob/v0.0.0/src/commands/index-images.js)_
<!-- commandsstop -->
