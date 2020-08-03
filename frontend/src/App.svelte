<script>
  // TODO: move this to some sort of config or input or whatever
  import DeltaE from 'empfindung'
  import { HsvPicker } from 'svelte-color-picker'
  // import tinycolor from 'tinycolor2'
  import fileIndex from '../../image-colour-export.json'
  import GridImageElement from './GridImageElement.svelte'

  export let sortedFilteredFiles = fileIndex
  export let allColours = []
  export let colourFilter = ''
  export let filterColour = false
  export let heartedOnly = false
  export let filtering = false
  export let allowedColourDifference = 0.1

  fileIndex.forEach((file) => {
    // merge the palettes
    allColours = allColours.concat(
      file.palette.filter((colour) => allColours.indexOf(colour) < 0),
    )
  })

  function colourChange(rgba) {
    // console.log('Found colour', rgba)
    // let tiny = new tinycolor(rgba.detail)
    colourFilter = [rgba.detail.r, rgba.detail.g, rgba.detail.b]
    filter()
  }

  function filter() {
    console.log('Filtering...')
    filtering = true
    sortedFilteredFiles = fileIndex.filter((file) => {
      if (heartedOnly && !file.hearted) {
        return false
      }
      let colourMatch = !filterColour
      if (filterColour && colourFilter != '') {
        for (let i = 0; i < file.palette.length; ++i) {
          let deltaDiff = DeltaE.getDeltaE00(colourFilter, file.palette[i])
          // console.log('Delta diff: ' + deltaDiff)
          if (deltaDiff < allowedColourDifference) {
            // console.log('Found acceptable image')
            return true
          }
        }
      }
      return colourMatch
    })
    filtering = false
    console.log(
      'Filtering done. ' + sortedFilteredFiles.length + ' images remaining.',
    )
  }

  // the grid layouting using Masonry
  import { onMount, afterUpdate } from 'svelte/internal'
  import Masonry from 'masonry-layout'
  let grid
  let masonryInstance
  onMount(async () => {
    masonryInstance = new Masonry(grid, {
      initLayout: false,
      columnWidth: '.grid-sizer',
      itemSelector: '.grid-item',
      percentPosition: true,
    })
  })

  afterUpdate(() => {
    masonryInstance.layout()
  })
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
  :global(.grid-item) {
    width: 20%;
  }
</style>

<main>
  <h1>ImageColourOrganizer</h1>
  <details>
    <summary>Filter options</summary>
    <div>
      <label>
        Allowed Colour Difference
        <input
          type="number"
          step="0.01"
          min="0"
          max="10"
          bind:value={allowedColourDifference}
          on:change={() => {
            filter()
          }} />
      </label>
      <label>
        Filter Colour
        <input
          type="checkbox"
          bind:checked={filterColour}
          on:change={() => {
            filter()
          }} />
      </label>
      <div hidden={!filterColour}>
        <HsvPicker on:colorChange={colourChange} startColor={'#FBFBFB'} />
      </div>
      <label>
        Only hearted
        <input
          type="checkbox"
          bind:checked={heartedOnly}
          on:change={() => {
            filter()
          }} />
      </label>
    </div>
  </details>
  {#if filtering}
    <div hidden={filtering}>Status: Filtering...</div>
  {/if}
  <div class="grid" bind:this={grid}>
    <div class="grid-sizer" style="width: 20%; min-height: 20vw" />
    {#each sortedFilteredFiles as file}
      <div class="grid-item">
        <GridImageElement
          filePath={file.originalPath}
          imageSizes={file.resizedImages}
          palette={file.palette}
          bind:hearted={file.hearted} />
      </div>
    {/each}
  </div>
</main>
