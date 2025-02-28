<script lang="ts">
  import Discard, { taintedMessage } from "$lib/components/modals/Discard.svelte"

  import { superForm } from "$lib/client/superform"
  import { MarkdownField, NumberField } from "$lib/components/forms"
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

  const { enhance, isTainted, tainted } = superform
</script>

<Discard />

<form method="post" action="?/update" enctype="multipart/form-data" use:enhance>
  <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={!isTainted($tainted)}>
    Update Candidate Settings
  </button>
  <NumberField {superform} field="candidateMaxUsers" name="Max Users in a Candidancy" />
  <NumberField {superform} field="candidateMaxDescription" name="Max Characters in Candidate Description" />
  <MarkdownField {superform} field="candidateDefaultDescription" name="Candidate Default Description" />
</form>
