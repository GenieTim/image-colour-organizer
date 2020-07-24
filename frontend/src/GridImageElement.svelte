<script>
  import LazyImage from "svelte-lazy-image";

  export let imagePath = "";
  export let palette = [];
  export let hearted = false;

  function toggleLike() {
    hearted = !hearted;
  }
</script>

<style>
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
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
  <LazyImage
    src={imagePath}
    placeholder="https://via.placeholder.com/250?text=placeholder"
    alt="Image from {imagePath}" />
  <button on:click={toggleLike}>
    {#if hearted}❤️{:else}♡{/if}
  </button>
  <ul>
    {#each palette as colour}
      <li style="background-color: {colour}" alt={colour} />
    {/each}
  </ul>
</div>
