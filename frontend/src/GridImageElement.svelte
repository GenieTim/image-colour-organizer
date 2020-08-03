<script>
  import { onMount } from 'svelte'
  import LazyImage from 'svelte-lazy-image'
  import { fromString } from 'uuidv4'

  export let filePath = ''
  export let imageSizes = {}
  export let palette = []
  export let hearted = false

  function hashCode(txt) {
    if (!txt) {
      return null
    }
    return fromString(txt) //crypto.createHash('md5').update(txt).digest('hex');
  }

  onMount(() => {
    let storageName = 'a' + hashCode(filePath)
    hearted = localStorage.getItem('storageName')

    return () => localStorage.setItem(storageName, hearted)
  })

  function toggleLike() {
    hearted = !hearted
  }
</script>

<style>
  img {
    z-index: 1;
    max-width: 20vw;
    height: auto;
  }

  ul {
    position: absolute;
    bottom: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    z-index: 2;
  }

  li {
    height: 0.5em;
    width: 0.5em;
    margin: 0;
    padding: 0.1em;
    display: inline-block;
  }
</style>

<div>
  <a href="file://{filePath}" title="Datei öffnen">
    <img
      src={imageSizes[600]}
      placeholder="https://via.placeholder.com/250?text=placeholder"
      alt="Image from {filePath}"
      loading="lazy" />
  </a>
  <button on:click={toggleLike}>
    {#if hearted}❤️{:else}♡{/if}
  </button>
  <ul>
    {#each palette as colour}
      <li
        style="background-color: rgb({colour[0]}, {colour[1]}, {colour[2]})"
        alt={colour} />
    {/each}
  </ul>
</div>
