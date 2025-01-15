<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte"
  import type { Snippet } from "svelte"

  let {
    open = $bindable(false),
    trigger,
    triggerBase,
    buttons,
    header,
    text,
  }: {
    open?: boolean
    trigger?: Snippet
    triggerBase?: string
    buttons?: Snippet
    header: string
    text: string
  } = $props()
</script>

<Modal triggerBase={trigger ? "btn " + triggerBase : "hidden"} contentBase="card bg-surface-100-900 shadow-xl max-w-sm w-full p-4" {trigger} bind:open>
  {#snippet content()}
    <header class="flex justify-between">
      <h2 class="h2">{header}</h2>
    </header>
    <article>
      <p>{text}</p>
    </article>
    <footer class="flex justify-between mt-4">
      <button type="button" class="btn preset-tonal" onclick={() => (open = false)}>Cancel</button>
      {@render buttons?.()}
    </footer>
  {/snippet}
</Modal>
