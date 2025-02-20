<script lang="ts">
  import type { Snippet } from "svelte"
  import type { ClassValue, HTMLAnchorAttributes } from "svelte/elements"

  const {
    aClass,
    children,
    disables,
    href,
    ...restProps
  }: {
    aClass?: ClassValue
    children?: Snippet
    href: string
    disables: {
      disabled: boolean
      text?: string
    }[]
  } & HTMLAnchorAttributes = $props()

  let disabled = $derived(disables.find((d) => d.disabled))
</script>

<a
  class={["btn", aClass, disabled ? (disabled.text ? "disabled" : "hidden") : "preset-filled-primary-500"]}
  href={disabled ? "javascript:void(0)" : href}
  {...restProps}
>
  {#if disabled}
    {disabled.text}
  {:else}
    {@render children?.()}
  {/if}
</a>

<style>
  .disabled {
    @apply preset-outlined-surface-400-600;
    pointer-events: none;
    cursor: not-allowed;
  }
</style>
