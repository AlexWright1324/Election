<script lang="ts">
  import { date } from "$lib/client/time.svelte"
  import DeleteModal from "$lib/components/modals/Delete.svelte"
  import Discard, { taintedMessage } from "$lib/components/modals/Discard.svelte"

  import { getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"
  import { DateTimeField, ImageField, MarkdownField, SwitchField, TextField } from "$lib/components/forms"
  import { DisableBox } from "$lib/components/forms/layout"

  import { determineSchema } from "./schema"

  import { getContext } from "svelte"
  import { zod } from "sveltekit-superforms/adapters"
  import { ZodEffects } from "zod"

  let { data } = $props()

  const superform = superForm(getContext("toast"), data.updateForm, {
    resetForm: false,
    taintedMessage,
  })

  const bypass: {
    value: boolean
  } = getContext("bypass")

  let {
    schema,
    status: disabledText,
    ignore: ignoredFields,
  } = $derived(determineSchema(date.now, data.election, bypass.value))
  $effect(() => {
    superform.options.validators = zod(schema)
  })

  const fieldsInSchema = (fields: string[]) => {
    let keys
    if (schema instanceof ZodEffects) {
      keys = Object.keys(schema._def.schema.shape)
    } else {
      keys = Object.keys(schema.shape)
    }
    keys = keys.filter((key) => !ignoredFields?.includes(key))
    return fields.every((field) => keys.includes(field))
  }

  const { enhance, isTainted, tainted } = superform
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
    <DisableBox disabled={!fieldsInSchema(["membersOnly", "ronEnabled", "motionEnabled"])} {disabledText}>
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
    {#if !fieldsInSchema( ["nominationsStart", "nominationsEnd"], ) && !fieldsInSchema( ["start"], ) && !fieldsInSchema( ["end"], )}
      <DisableBox disabled {disabledText}>
        <DateTimeField {superform} field="nominationsStart" name="Nominations Start Date" />
        <DateTimeField {superform} field="nominationsEnd" name="Nominations End Date" />
        <DateTimeField {superform} field="start" name="Start Date" />
        <DateTimeField {superform} field="end" name="End Date" />
      </DisableBox>
    {:else}
      <DisableBox disabled={!fieldsInSchema(["nominationsStart", "nominationsEnd"])} {disabledText}>
        <DateTimeField {superform} field="nominationsStart" name="Nominations Start Date" />
        <DateTimeField {superform} field="nominationsEnd" name="Nominations End Date" />
      </DisableBox>
      {#if !fieldsInSchema(["start"]) && !fieldsInSchema(["end"])}
        <DisableBox disabled={true} {disabledText}>
          <DateTimeField {superform} field="start" name="Start Date" />
          <DateTimeField {superform} field="end" name="End Date" />
        </DisableBox>
      {:else}
        <DisableBox disabled={!fieldsInSchema(["start"])} {disabledText}>
          <DateTimeField {superform} field="start" name="Start Date" />
        </DisableBox>
        <DisableBox disabled={!fieldsInSchema(["end"])} {disabledText}>
          <DateTimeField {superform} field="end" name="End Date" />
        </DisableBox>
      {/if}
    {/if}
  </main>
</form>

<h2 class="h2 mb-4">Danger Zone</h2>
<DeleteModal name="Election" />
