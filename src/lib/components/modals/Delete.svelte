<script lang="ts">
  import { enhance } from "$app/forms"
  import CustomModal from "./Custom.svelte"

  let {
    name,
  }: {
    name: string
  } = $props()
</script>

<CustomModal header="Delete {name}" text="Are you sure you want to delete this {name}?" triggerBase="preset-filled-error-400-600">
  {#snippet trigger()}
    Delete {name}
  {/snippet}
  {#snippet buttons()}
    <form method="post" action="?/delete" use:enhance>
      <button type="submit" class="btn preset-filled-error-400-600">Delete {name}</button>
    </form>
  {/snippet}
</CustomModal>
