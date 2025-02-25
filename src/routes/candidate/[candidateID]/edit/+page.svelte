<script lang="ts">
  import Discard, { taintedMessage } from "$lib/components/modals/Discard.svelte"
  import LeaveModal from "$lib/components/modals/Leave.svelte"

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

<Discard />

<div class="flex flex-wrap gap-2">
  <button form="update" type="submit" class="btn preset-filled-primary-500" disabled={!isTainted($tainted)}>
    Update Candidate
  </button>
  <LeaveModal name="Candidancy" />
</div>

<form
  class="flex grow flex-wrap gap-4"
  id="update"
  method="post"
  action="?/update"
  enctype="multipart/form-data"
  use:enhance
>
  <ImageField {superform} field="image" name="Candidate Banner Image" src={coverImgSrc} />
  <MarkdownField {superform} field="description" name="Description" />
</form>
