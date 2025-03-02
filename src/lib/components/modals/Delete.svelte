<script lang="ts">
  import { enhance } from "$app/forms"
  import { Modal } from "@skeletonlabs/skeleton-svelte"
  import { X } from "lucide-svelte"

  let {
    name,
  }: {
    name: string
  } = $props()

  let open = $state(false)
  let modalResolve = $state<(value: boolean | PromiseLike<boolean>) => void>()
</script>

<Modal
  {open}
  onOpenChange={(e: { open: boolean }) => (open = e.open)}
  triggerBase="btn preset-filled-error-500"
  backdropClasses="backdrop-blur-sm"
  contentBase="preset-filled-surface-100-900 preset-outlined-surface-200-800 w-full max-w-lg overflow-hidden rounded-xl shadow-xl"
>
  {#snippet trigger()}
    Delete {name}
  {/snippet}
  {#snippet content()}
    <header class="bg-surface-200-800 flex items-center justify-between p-4 pt-3 pr-1 pb-2 text-lg font-semibold">
      <p>Delete {name}?</p>
      <button type="button" class="btn text-lg" onclick={() => (open = false)}>
        <X size="1em" />
      </button>
    </header>
    <article class="border-b-surface-200-800 border-b p-4">
      <p>Are you sure you want to delete this {name}?</p>
      <p>This action is IRREVERSIBLE!!!</p>
    </article>
    <footer class="flex justify-end gap-2 p-2">
      <button type="button" class="btn preset-tonal hover:preset-tonal" onclick={() => (open = false)}> Cancel </button>
      <form method="post" action="?/delete" use:enhance>
        <button
          type="submit"
          class="btn preset-filled-error-500"
          onclick={() => {
            modalResolve?.(true)
            open = false
          }}>Delete {name}</button
        >
      </form>
    </footer>
  {/snippet}
</Modal>
