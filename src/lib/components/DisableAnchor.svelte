<script lang="ts">
  import type { ClassValue, HTMLAnchorAttributes } from "svelte/elements"

  interface Props extends HTMLAnchorAttributes {
    class?: ClassValue
    disabled: boolean
    text: string
    disabledText?: string
  }

  let { class: classes, text, disabled, disabledText, ...restProps }: Props = $props()
</script>

<a
  class={[
    "btn",
    disabled ? (disabledText ? "disabled preset-outlined" : "hidden") : "preset-filled-primary-500",
    classes,
  ]}
  {...restProps}
>
  {#if disabled}
    {disabledText}
  {:else}
    {text}
  {/if}
</a>

<style lang="postcss">
  @reference "$lib/stylesheets/app.css";

  .disabled {
    cursor: auto;
    pointer-events: none;
  }
</style>
