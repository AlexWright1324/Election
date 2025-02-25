<script lang="ts" module>
  let open = $state(true)
  let modalResolve = $state<(value: boolean | PromiseLike<boolean>) => void>()

  export const taintedMessage = () => {
    return new Promise<boolean>((resolve) => {
      open = true
      modalResolve = resolve
    })
  }

  const onclick = () => {
    modalResolve?.(true)
    open = false
  }
</script>

<script lang="ts">
  import CustomModal from "./Custom.svelte"
</script>

<CustomModal bind:open header="Discard unsaved changes?" text="This will dicard all edits since the last save.">
  {#snippet buttons()}
    <button type="button" class="btn preset-filled-error-500" {onclick}>Discard Changes</button>
  {/snippet}
</CustomModal>
