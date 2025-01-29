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
  <nav class="btn-group preset-outlined-surface-200-800 mb-2">
    {@render children()}
  </nav>
{/if}
