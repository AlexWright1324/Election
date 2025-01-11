<script lang="ts">
  import type { Snippet } from "svelte"

  let { children, name } = $props<{
    children: Snippet
    name?: string
  }>()
</script>

{#if children}
  {#if name}
    <span class="label-text">{name}</span>
  {/if}
  <nav>
    {@render children()}
  </nav>
{/if}

<style lang="postcss">
  nav {
    @apply btn-group preset-outlined-surface-800-200 mb-2;
  }
</style>
