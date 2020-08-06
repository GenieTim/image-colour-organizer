<script>
  // TODO: move this to some sort of config or input or whatever
  import { HsvPicker } from 'svelte-color-picker'
  import fileIndex from '../../image-colour-export.json'
  import GridImageElement from './GridImageElement.svelte'
  import { deltaE, rgb2lab } from './utils/colourUtil'

  export let sortedFilteredFiles = fileIndex
  export let allColours = []
  export let colourFilter = ''
  export let filterColour = false
  export let heartedOnly = false // whether to show only hearted
  export let filtering = false
  export let allowedColourDifference = 12.2

  fileIndex.forEach((file) => {
    // merge the palettes
    allColours = allColours.concat(
      file.palette.filter((colour) => allColours.indexOf(colour) < 0),
    )
  })

  function colourChange(rgba) {
    // console.log('Found colour', rgba)
    // let tiny = new tinycolor(rgba.detail)
    colourFilter = rgb2lab([rgba.detail.r, rgba.detail.g, rgba.detail.b])
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
          let deltaDiff = deltaE(colourFilter, rgb2lab(file.palette[i]))
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
</script>

<style>
  main {
    /* text-align: center; */
    padding: 1em;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    /* grid-auto-rows: 1em; */
  }

  details {
    margin: 1em;
  }

  hr {
    border-width: 1px;
  }
</style>

<main>
  <h1>ImageColourOrganizer</h1>
  <hr />
  <details>
    <summary>Filter options</summary>
    <div>
      <form>
        <div class="form-group">
          <label for="allowedXolourDiff">Allowed Colour Difference</label>
          <input
            type="number"
            id="allowedColourDiff"
            step="0.1"
            min="0"
            max="50"
            class="form-control"
            bind:value={allowedColourDifference}
            on:change={() => {
              filter()
            }} />
        </div>
        <div class="form-group">
          <div class="form-check">
            <input
              type="checkbox"
              id="filterColour"
              class="form-check-input"
              bind:checked={filterColour}
              on:change={() => {
                filter()
              }} />
            <label for="filterColour">Filter Colour</label>
          </div>
        </div>
        <div class="form-group">
          <div hidden={!filterColour}>
            <HsvPicker on:colorChange={colourChange} startColor={'#B01BCF'} />
          </div>
        </div>
        <div class="form-group">
          <div class="form-check">

            <input
              type="checkbox"
              id="heartedOnly"
              class="form-check-input"
              bind:checked={heartedOnly}
              on:change={() => {
                filter()
              }} />
            <label for="heartedOnly">Only hearted</label>
          </div>
        </div>
      </form>
    </div>
  </details>
  <hr />
  {#if filtering}
    <div hidden={filtering}>Status: Filtering...</div>
  {/if}
  <div class="grid">
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
