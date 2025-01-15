<script lang="ts">
  import CustomModal from "./Custom.svelte"

  let modalResolve = $state<(value: boolean | PromiseLike<boolean>) => void>()
  let open = $state(false)

  export const taintedMessage = () => {
    return new Promise<boolean>((resolve) => {
      open = true
      modalResolve = resolve
    })
  }
</script>

<CustomModal bind:open header="Unsaved Changes" text="Are you sure you want to leave?">
  {#snippet buttons()}
    <button type="button" class="btn preset-filled-error-500" onclick={() => modalResolve?.(true)}>
      Discard Changes
    </button>
  {/snippet}
</CustomModal>
