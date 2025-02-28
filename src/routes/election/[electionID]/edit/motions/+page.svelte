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
    Update Motion Settings
  </button>
  <NumberField {superform} field="motionMaxSeconders" name="Max Seconders" />
  <NumberField {superform} field="motionMaxDescription" name="Max Characters in Motion Description" />
  <MarkdownField {superform} field="motionDefaultDescription" name="Motion Default Description" />
</form>
