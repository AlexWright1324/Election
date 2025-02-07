<script lang="ts">
  import { page } from "$app/state"
  import type { Snippet } from "svelte"

  let { href, badge, children } = $props<{
    href: string
    badge?: number
    children?: Snippet
  }>()
</script>

<a class="btn relative" {href} aria-current={page.url.pathname === href ? "page" : undefined}>
  {#if badge}
    <span class="badge-icon preset-filled-primary-500 absolute -right-2 -top-2">{badge}</span>
  {/if}
  {@render children?.()}
</a>

<style>
  a {
    &[aria-current="page"] {
      @apply preset-tonal-primary;
    }

    &:hover {
      @apply preset-tonal-secondary;
    }
  }
</style>
