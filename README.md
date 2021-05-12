# image-colour-organizer
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGenieTim%2Fimage-colour-organizer.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FGenieTim%2Fimage-colour-organizer?ref=badge_shield)

A toolset providing (a) indexer of photos/images and (b) a frontend to sort &amp; filter the images by colour

## Usage

Currently, the usage requires some work:

1. You need to have [nodejs](https://nodejs.org/en/) installed
2. You need to either clone or download this repository
3. You need to install the dependencies of both components:
   1. `cd backend && npm install && cd ../frontend && npm install && cd ..`
4. Now you can execute the indexer: `./backend/bin/run index-images --debug "absolute/path/to/your/images" > debug_out.txt`
5. Finally, when that one has run, you may start the server to display the user interface: `cd frontend && npm run dev`
6. Open the link that is displayed in the console; probably [http://localhost:5000/](http://localhost:5000/). Have fun!




## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGenieTim%2Fimage-colour-organizer.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FGenieTim%2Fimage-colour-organizer?ref=badge_large)