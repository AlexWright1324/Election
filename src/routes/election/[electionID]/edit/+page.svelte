<script lang="ts">
  import DeleteModal from "$lib/components/modals/Delete.svelte"
  import UnsavedModal, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"

  import { getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"
  import { DateTimeField, ImageField, MarkdownField, NumberField, SwitchField, TextField } from "$lib/components/forms"

  import { updateSchema } from "./schema"
  import { getContext } from "svelte"
  import { zodClient } from "sveltekit-superforms/adapters"

  let { data } = $props()

  const superform = superForm(getContext("toast"), data.updateForm, {
    resetForm: false,
    validators: zodClient(updateSchema),
    taintedMessage,
  })

  const { form, enhance, isTainted, tainted } = superform
</script>

<UnsavedModal />

<div class="flex flex-wrap gap-2">
  <button form="update" type="submit" class="btn preset-filled-primary-500" disabled={!isTainted($tainted)}>
    Update Election
  </button>
  <DeleteModal name="Election" />
</div>

<div class="flex flex-wrap gap-4">
  <form
    class="gap-4 basis-64 grow"
    id="update"
    method="post"
    action="?/update"
    enctype="multipart/form-data"
    use:enhance
  >
    <div class="flex flex-wrap [&>*]:max-w-40">
      <SwitchField {superform} field="membersOnly" name="Members Only" />
      <SwitchField {superform} field="published" name="Published" />
    </div>
    <TextField {superform} field="name" name="Title" />
    <ImageField
      {superform}
      field="image"
      name="Banner Image"
      src={getElectionCoverImage(data.election.id, data.election.imageVersion)}
    />
    <DateTimeField {superform} field="signUpEnd" name="Sign-up End Date" />
    <DateTimeField {superform} field="start" name="Start Date" />
    <DateTimeField {superform} field="end" name="End Date" />
    <MarkdownField {superform} field="description" name="Description" />

    <h4 class="h4">Candidate Settings</h4>
    <NumberField {superform} field="candidateMaxUsers" name="Max Users in a Candidancy" />
    <NumberField {superform} field="candidateMaxDescription" name="Max Characters in Candidate Description" />
    <MarkdownField {superform} field="candidateDefaultDescription" name="Candidate Default Description" />

    <h4 class="h4">Motion Settings</h4>
    <SwitchField {superform} field="motionEnabled" name="Motions Enabled" />
    {#if $form.motionEnabled}
      <NumberField {superform} field="motionMaxDescription" name="Max Characters in Motion Description" />
      <NumberField {superform} field="motionMaxSeconders" name="Max Seconders" />
      <MarkdownField {superform} field="motionDefaultDescription" name="Motion Default Description" />
    {/if}
  </form>
</div>
