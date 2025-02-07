<script lang="ts">
  import { enhance } from "$app/forms"

  import CustomModal from "$lib/components/modals/Custom.svelte"

  let {
    name,
  }: {
    name: string
  } = $props()
</script>

<CustomModal
  header="Leave {name}"
  text="Are you sure you want to leave this {name}?"
  triggerBase="preset-filled-error-500"
>
  {#snippet trigger()}
    Leave
  {/snippet}
  {#snippet buttons()}
    <form method="post" action="?/leave" use:enhance>
      <button type="submit" class="btn preset-filled-error-500">Leave</button>
    </form>
  {/snippet}
</CustomModal>
