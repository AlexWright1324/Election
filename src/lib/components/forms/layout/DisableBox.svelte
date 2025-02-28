<script lang="ts">
  import { Lock } from "lucide-svelte"
  import type { Snippet } from "svelte"

  let {
    children,
    disabled,
    disabledText,
  }: {
    children: Snippet
    disabled: boolean
    disabledText?: string
  } = $props()
</script>

{#if disabled}
  <div class="borderstyle relative">
    <div
      class="mr-3 ml-3 flex w-fit items-center gap-1 bg-[var(--body-background-color)] pr-1 pl-1 text-sm dark:bg-[var(--body-background-color-dark)]"
    >
      <Lock size="1rem" />
      <span>{disabledText}</span>
    </div>
    <div class="p-4 pt-0 opacity-40" inert>
      {@render children()}
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style lang="postcss">
  @reference "$lib/stylesheets/app.css";

  .borderstyle::before {
    @apply preset-outlined absolute top-[0.5rem] right-0 bottom-0 left-0 -z-10 rounded content-[""];
  }
</style>
