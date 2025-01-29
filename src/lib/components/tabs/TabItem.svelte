<script lang="ts">
  import { page } from "$app/state"
  import type { Snippet } from "svelte"

  let { href, children } = $props<{
    href: String
    children?: Snippet
  }>()
</script>

<a class="btn" {href} aria-current={page.url.pathname === href ? "page" : undefined}>{@render children?.()}</a>

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
