<script lang="ts">
  import { superForm } from "sveltekit-superforms"
  import { getCandidateCoverImage } from "$lib/client/store"
  import LeaveModal from "$lib/components/modals/Leave.svelte"
  import MarkdownInput from "$lib/components/input/MarkdownInput.svelte"
  import Unsaved, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"
  import ImageInput, { updateImage } from "$lib/components/input/ImageInput.svelte"

  let { data } = $props()

  const { form, errors, enhance, isTainted, tainted } = superForm(data.editForm!, {
    dataType: "json",
    resetForm: false,
    onUpdated: updateImage,
    taintedMessage: taintedMessage,
  })
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
  <ImageInput
    alt="Candidate Portrait"
    src={getCandidateCoverImage(data.election.id, data.candidate.id)}
    bind:file={$form.image}
  />
  <MarkdownInput bind:value={$form.description} />
  <div>
    <span class="label-text">Roles</span>
    <p class="text-error-500">
      {$errors.roles?._errors}
    </p>
    {#each $form.roles as role}
      <label class="flex items-center gap-x-2">
        <input type="hidden" name="roleID" bind:value={role.id} />
        <input class="checkbox" type="checkbox" bind:checked={role.checked} />
        <p>{role.name}</p>
      </label>
    {/each}
  </div>
</form>
