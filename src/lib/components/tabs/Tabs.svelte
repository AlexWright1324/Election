<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    children,
    name,
  }: {
    children: Snippet
    name?: string
  } = $props()
</script>

{#if children}
  {#if name}
    <span class="label-text">{name}</span>
  {/if}
  <nav class="btn-group flex-wrap preset-outlined-surface-200-800 mb-2">
    {@render children()}
  </nav>
{/if}
