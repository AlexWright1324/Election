<script lang="ts">
  import { date } from "$lib/client/time.svelte"
  import DeleteModal from "$lib/components/modals/Delete.svelte"
  import Discard, { taintedMessage } from "$lib/components/modals/Discard.svelte"

  import { getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"
  import { DateTimeField, ImageField, MarkdownField, NumberField, SwitchField, TextField } from "$lib/components/forms"
  import { DisableBox } from "$lib/components/forms/layout"

  import { updateSchema } from "./schema"

  import { getContext } from "svelte"
  import { zodClient } from "sveltekit-superforms/adapters"

  let { data } = $props()

  const superform = superForm(getContext("toast"), data.updateForm, {
    resetForm: false,
    validators: zodClient(updateSchema),
    taintedMessage,
  })

  let votingNow = $derived.by(() => {
    if (!(data.election.start && data.election.end)) return false
    return data.election.start < date.now && data.election.end > date.now
  })

  const { form, enhance, isTainted, tainted } = superform
</script>

<Discard />

<form
  class="flex flex-wrap gap-x-4"
  id="update"
  method="post"
  action="?/update"
  enctype="multipart/form-data"
  use:enhance
>
  <aside class="w-full lg:w-96">
    <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={!isTainted($tainted)}>
      Update Election
    </button>
    <DisableBox disabled={votingNow} disabledText="Election is ongoing">
      <SwitchField {superform} field="published" name="Publish Election">
        {#snippet enabledText()}
          This election is published and visible to everyone.
        {/snippet}
        {#snippet disabledText()}
          This election is not published and is only visible to admins.
        {/snippet}
      </SwitchField>
      <SwitchField {superform} field="membersOnly" name="Members Only">
        {#snippet enabledText()}
          Only members can vote in this election.
        {/snippet}
        {#snippet disabledText()}
          Everyone can vote in this election.
        {/snippet}
      </SwitchField>
      <SwitchField {superform} field="ronEnabled" name="RON Enabled">
        {#snippet enabledText()}
          Re-Open Nominations are enabled.
        {/snippet}
        {#snippet disabledText()}
          Re-Open Nominations are disabled.
        {/snippet}
      </SwitchField>
      <SwitchField {superform} field="motionEnabled" name="Motions Enabled">
        {#snippet enabledText()}
          Motions can be created.
        {/snippet}
        {#snippet disabledText()}
          Motions cannot be created.
        {/snippet}
      </SwitchField>
    </DisableBox>
    <ImageField
      {superform}
      field="image"
      name="Election Image"
      src={getElectionCoverImage(data.election.id, data.election.imageVersion)}
    />
  </aside>
  <main class="flex-1">
    <TextField {superform} field="name" name="Title" />
    <MarkdownField {superform} field="description" name="Description" />
    <DateTimeField {superform} field="nominationsStart" name="Nominations Start Date" />
    <DateTimeField {superform} field="nominationsEnd" name="Nominations End Date" />
    <DisableBox disabled={votingNow} disabledText="Election is ongoing">
      <DateTimeField {superform} field="start" name="Start Date" />
      <DateTimeField {superform} field="end" name="End Date" />
    </DisableBox>

    <h4 class="h4">Candidate Settings</h4>

    <NumberField {superform} field="candidateMaxUsers" name="Max Users in a Candidancy" />
    <NumberField {superform} field="candidateMaxDescription" name="Max Characters in Candidate Description" />
    <MarkdownField {superform} field="candidateDefaultDescription" name="Candidate Default Description" />

    {#if $form.motionEnabled}
      <h4 class="h4">Motion Settings</h4>
      <NumberField {superform} field="motionMaxDescription" name="Max Characters in Motion Description" />
      <NumberField {superform} field="motionMaxSeconders" name="Max Seconders" />
      <MarkdownField {superform} field="motionDefaultDescription" name="Motion Default Description" />
    {/if}
  </main>
</form>

<h2 class="h2 mb-4">Danger Zone</h2>
<DeleteModal name="Election" />
