<script>
  // TODO: move this to some sort of config or input or whatever
  import DeltaE from 'delta-e'
  import { HsvPicker } from 'svelte-color-picker'
  import tinycolor from 'tinycolor2'
  import fileIndex from '../../image-colour-export.json'
  import GridImageElement from './GridImageElement.svelte'

  export let sortedFilteredFiles = fileIndex
  export let allColours = []
  export let colourFilter = ''
  export let filterColour = false
  export let heartedOnly = false
  export let filtering = false

  fileIndex.forEach((file) => {
    // merge the palettes
    allColours = allColours.concat(
      file.palette.filter((colour) => allColours.indexOf(colour) < 0),
    )
  })

  function colourChange(rgba) {
    console.log('Found colour', rgba)
    let tiny = new tinycolor(rgba.detail)
    colourFilter = {
      L: tiny.getLuminance(),
      A: tiny.getAlpha(),
      B: tiny.getBrightness(),
    }
    filter()
  }

  function filter() {
    filtering = true
    sortedFilteredFiles = fileIndex.filter((file) => {
      if (heartedOnly && !file.hearted) {
        return false
      }
      let colourMatch = !filterColour
      if (filterColour && colourFilter != '') {
        file.palette.forEach((colour) => {
          let tiny = new tinycolor(rgba.detail)
          let objectiveColour = {
            L: tiny.getLuminance(),
            A: tiny.getAlpha(),
            B: tiny.getBrightness(),
          }
          // TODO: find better value instead of "5"
          if (DeltaE.getDeltaE00(filterColour, objectiveColour) < 5) {
            return true
          }
        })
      }
      return colourMatch
    })
    filtering = false
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
        Filter Colour
        <input
          type="checkbox"
          bind:checked={filterColour}
          on:change={filter()} />
      </label>
      <HsvPicker
        on:colorChange={colourChange}
        hidden={!filterColour}
        startColor={'#FBFBFB'} />
      <input type="checkbox" bind:checked={heartedOnly} on:blur={filter()} />
    </div>
  </details>
  {#if filtering}
    <div>Status: Filtering...</div>
  {/if}
  <div class="grid" bind:this={grid}>
    <div class="grid-sizer" style="width: 20%" />
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
