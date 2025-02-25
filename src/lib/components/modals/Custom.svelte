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

<Modal triggerBase={trigger ? "btn " + triggerBase : "hidden"} {trigger} backdropClasses="backdrop-blur-sm" bind:open>
  {#snippet content()}
    <article
      class="bg-surface-50-950 preset-outlined-surface-200-800 w-full max-w-md overflow-hidden rounded-xl shadow-xl"
    >
      <header class="bg-surface-100-900 flex justify-between p-4">
        <h5 class="h5">{header}</h5>
      </header>
      <main class="border-b-surface-200-800 border-b p-4">
        <p>{text}</p>
      </main>
      <footer class="flex justify-end gap-2 p-4">
        <button type="button" class="btn preset-tonal hover:preset-tonal" onclick={() => (open = false)}>
          Keep Editing
        </button>
        {@render buttons?.()}
      </footer>
    </article>
  {/snippet}
</Modal>
