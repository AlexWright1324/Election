<script lang="ts">
  import { superForm } from "sveltekit-superforms"

  import MarkdownInput from "$lib/components/input/MarkdownInput.svelte"
  import Unsaved, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"
  import DeleteModal from "$lib/components/modals/Delete.svelte"

  let { data } = $props()

  const { form, enhance, isTainted, tainted } = superForm(data.editForm, {
    dataType: "json",
    resetForm: false,
    taintedMessage: taintedMessage,
  })
</script>

<Unsaved />

<div class="flex flex-wrap gap-2">
  <button form="edit" type="submit" class="btn preset-filled-primary-500" disabled={!isTainted($tainted)}>
    Update Motion
  </button>
  <DeleteModal name="Motion" />
</div>

<form
  class="flex flex-wrap gap-4 grow"
  id="edit"
  method="post"
  action="?/edit"
  enctype="multipart/form-data"
  use:enhance
>
  <label class="label">
    <span class="label-text">Name</span>
    <input class="input" type="text" bind:value={$form.name} />
  </label>
  <MarkdownInput bind:value={$form.description} />
</form>
