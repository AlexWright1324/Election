<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { getCandidateCoverImage } from "$lib/client/store"

  import { MarkdownEditor } from "carta-md"
  import { superForm } from "sveltekit-superforms"

  import CustomModal from "$lib/components/modals/Custom.svelte"
  import Unsaved from "$lib/components/modals/Unsaved.svelte"

  let { data } = $props()

  let coverImgSrc = $state(getCandidateCoverImage(data.election.id, data.candidate.id))

  let unsavedModal: Unsaved

  const { form, errors, enhance, isTainted, tainted } = superForm(data.editForm!, {
    dataType: "json",
    resetForm: false,
    onUpdated: () => {
      coverImgSrc = getCandidateCoverImage(data.election.id, data.candidate.id)
    },
    taintedMessage: () => unsavedModal.taintedMessage(),
  })

  let unsaved = $derived(isTainted($tainted))
</script>

<Unsaved bind:this={unsavedModal} />

<div class="flex flex-wrap gap-2">
  <button form="update" type="submit" class="btn preset-filled-primary-500" disabled={!unsaved}>
    Update Candidate
  </button>
  <CustomModal
    header="Leave Candidancy"
    text="Are you sure you want to leave this candidancy?"
    triggerBase="preset-filled-error-500"
  >
    {#snippet trigger()}
      Leave
    {/snippet}
    {#snippet buttons()}
      <form method="post" action="?/leave" use:enhance>
        <button type="submit" class="btn preset-filled-error-500">Leave</button>
      </form>
    {/snippet}
  </CustomModal>
</div>

<form
  class="flex flex-wrap gap-4 grow"
  id="update"
  method="post"
  action="?/update"
  enctype="multipart/form-data"
  use:enhance
>
  <label class="label">
    <span class="label-text">Banner Image</span>
    <img class="p-4 max-w-xs max-h-[320px] preset-outlined-primary-200-800" src={coverImgSrc} alt="Candidate Banner" />
    <input class="input" type="file" name="image" accept="image/*" bind:value={$form.image} />
  </label>
  <label class="label">
    <span class="label-text">Description</span>
    <input type="hidden" name="description" bind:value={$form.description} />
    <MarkdownEditor {carta} bind:value={$form.description} mode="tabs" />
  </label>
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
