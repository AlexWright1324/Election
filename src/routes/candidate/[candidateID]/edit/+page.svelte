<script lang="ts">
  import LeaveModal from "$lib/components/modals/Leave.svelte"
  import Unsaved, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"

  import { getCandidateCoverImage } from "$lib/client/store"
  import { ImageField, MarkdownField } from "$lib/components/forms/index"

  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  let coverImgSrc = $state(getCandidateCoverImage(data.candidate.role.election.id, data.candidate.id))
  const superform = superForm(data.editForm, {
    dataType: "json",
    resetForm: false,
    onUpdated: () => {
      coverImgSrc = getCandidateCoverImage(data.candidate.role.election.id, data.candidate.id)
    },
    taintedMessage: taintedMessage,
  })
  const { enhance, isTainted, tainted } = superform
</script>

<Unsaved />

<div class="flex flex-wrap gap-2">
  <button form="update" type="submit" class="btn preset-filled-primary-500" disabled={!isTainted($tainted)}>
    Update Candidate
  </button>
  <LeaveModal name="Candidancy" />
</div>

<form
  class="flex flex-wrap gap-4 grow"
  id="update"
  method="post"
  action="?/update"
  enctype="multipart/form-data"
  use:enhance
>
  <ImageField {superform} field="image" name="Candidate Banner Image" src={coverImgSrc} />
  <MarkdownField {superform} field="description" name="Description" />
</form>
