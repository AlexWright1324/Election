<script lang="ts">
  import DeleteModal from "$lib/components/modals/Delete.svelte"
  import Unsaved, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"

  import { superForm } from "$lib/client/superform"
  import { MarkdownField, TextField } from "$lib/components/forms/index"

  import { editFormSchema } from "./schema"
  import { getContext } from "svelte"
  import { zodClient } from "sveltekit-superforms/adapters"

  let { data } = $props()

  const editSuperform = superForm(getContext("toast"), data.editForm, {
    resetForm: false,
    taintedMessage: taintedMessage,
    validators: zodClient(editFormSchema),
  })

  const { enhance, isTainted, tainted } = editSuperform
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
  <TextField superform={editSuperform} field="name" name="Title" />
  <MarkdownField superform={editSuperform} field="description" name="Description" />
</form>
