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
    <span class="block p-2 text-sm">{name}</span>
  {/if}
  <nav class="btn-group preset-outlined-surface-200-800 mb-2 w-full flex-wrap">
    {@render children()}
  </nav>
{/if}
