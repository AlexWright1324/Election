<script lang="ts">
  import type { ClassValue, HTMLButtonAttributes } from "svelte/elements"

  interface Props extends HTMLButtonAttributes {
    class?: ClassValue
    disabled: boolean
    text: string
    disabledText?: string
  }

  let { class: classes, text, disabled, disabledText, ...restProps }: Props = $props()
</script>

<button
  class={["btn", classes, disabled ? "preset-outlined cursor-auto" : "preset-filled-primary-500"]}
  {...restProps}
  {disabled}
>
  {#if disabled}
    {disabledText}
  {:else}
    {text}
  {/if}
</button>
