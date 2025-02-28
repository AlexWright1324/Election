<script lang="ts">
  import { page } from "$app/state"
  import { Lock } from "lucide-svelte"
  import { getContext, type Snippet } from "svelte"

  let {
    href,
    badge,
    children,
    locked,
    nested,
  }: {
    href: string
    badge?: number
    children?: Snippet
    locked?: boolean
    nested?: boolean
  } = $props()

  let current = $derived.by(() => {
    if (nested) return page.url.pathname.startsWith(href)
    return page.url.pathname === href
  })

  const bypass: {
    value: boolean
  } = getContext("bypass")

  let isLocked = $derived.by(() => {
    if (bypass.value) return false
    return locked
  })
</script>

<a class="btn relative {isLocked ? 'locked' : ''}" {href} aria-current={current ? "page" : undefined}>
  {#if badge}
    <span class="badge-icon preset-filled-primary-500 absolute -top-2 -right-2">{badge}</span>
  {/if}
  {#if isLocked}
    <span>
      <Lock size="1em" />
    </span>
  {/if}
  {@render children?.()}
</a>

<style lang="postcss">
  @reference "$lib/stylesheets/app.css";

  a {
    &[aria-current="page"] {
      @apply preset-tonal-primary;
    }

    &:hover {
      @apply preset-tonal-secondary;
    }
  }

  .locked {
    @apply preset-outlined-error-500 pointer-events-none;
  }
</style>
