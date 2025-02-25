<script lang="ts" module>
  export const taintedMessage = () => {
    return new Promise<boolean>((resolve) => {
      open = true
      modalResolve = resolve
    })
  }

  let open = $state(false)
  let modalResolve = $state<(value: boolean | PromiseLike<boolean>) => void>()
</script>

<script lang="ts">
  import { Modal } from "@skeletonlabs/skeleton-svelte"
  import { X } from "lucide-svelte"
</script>

<Modal
  bind:open
  backdropClasses="backdrop-blur-sm"
  contentBase="preset-filled-surface-100-900 preset-outlined-surface-200-800 w-full max-w-lg overflow-hidden rounded-xl shadow-xl"
>
  {#snippet content()}
    <header class="bg-surface-200-800 flex items-center justify-between p-4 pt-3 pr-1 pb-2 text-lg font-semibold">
      <p>Discard unsaved changes?</p>
      <button type="button" class="btn text-lg" onclick={() => (open = false)}>
        <X size="1em" />
      </button>
    </header>
    <article class="border-b-surface-200-800 border-b p-4">
      <p>This will discard all edits since the last save.</p>
    </article>
    <footer class="flex justify-end gap-2 p-2">
      <button type="button" class="btn preset-tonal hover:preset-tonal" onclick={() => (open = false)}>
        Keep Editing
      </button>
      <button
        type="button"
        class="btn preset-filled-error-500"
        onclick={() => {
          modalResolve?.(true)
          open = false
        }}
      >
        Discard Changes
      </button>
    </footer>
  {/snippet}
</Modal>
