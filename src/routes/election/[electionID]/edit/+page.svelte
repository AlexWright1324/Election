<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { getElectionCoverImage } from "$lib/client/store"

  import { MarkdownEditor } from "carta-md"
  import { superForm } from "sveltekit-superforms"
  import UnsavedModal from "$lib/components/modals/Unsaved.svelte"
  import DeleteModal from "$lib/components/modals/Delete.svelte"
  import CrossTickSwitch from "$lib/components/switches/CrossTickSwitch.svelte"

  let { data } = $props()

  let coverImgSrc = $state(getElectionCoverImage(data.election.id))

  let deleteModalOpen = $state(false)
  let unsavedModal: UnsavedModal

  const { form, enhance, isTainted, tainted } = superForm(data.updateForm!, {
    resetForm: false,
    onUpdated: () => {
      coverImgSrc = getElectionCoverImage(data.election.id)
    },
    taintedMessage: () => unsavedModal.taintedMessage(),
  })

  let unsaved = $derived(isTainted($tainted))
</script>

<UnsavedModal bind:this={unsavedModal} />

<div class="flex flex-wrap gap-2">
  <button form="update" type="submit" class="btn preset-filled-primary-500" disabled={!unsaved}>Update Election</button>
  <DeleteModal name="election" />
</div>

<div class="flex flex-wrap gap-4">
  <form
    id="update"
    method="post"
    action="?/update"
    enctype="multipart/form-data"
    use:enhance
    class="gap-4 basis-64 grow"
  >
    <input type="hidden" name="description" bind:value={$form.description} />
    <div class="flex flex-wrap gap-4 p-4">
      <p>Published</p>
      <CrossTickSwitch name="published" bind:checked={$form.published} />
    </div>
    <label class="label">
      <span class="label-text">Title</span>
      <input class="input" type="text" name="name" bind:value={$form.name} />
    </label>

    <label class="label">
      <img class="p-4 max-w-xs preset-outlined-primary-200-800" src={coverImgSrc} alt="Election Banner" />
      <span class="label-text">Banner Image</span>
      <input class="input" type="file" name="image" accept="image/*" bind:value={$form.image} />
    </label>

    <div class="flex gap-4 flex-wrap">
      <label class="label flex-1">
        <span class="label-text">Start Date</span>
        <input class="input" type="datetime-local" name="start" bind:value={$form.start} />
      </label>
      <label class="label flex-1">
        <span class="label-text">End Date</span>
        <input class="input" type="datetime-local" name="end" bind:value={$form.end} />
      </label>
    </div>
    <div class="flex gap-4 flex-wrap">
      <label class="label flex-1">
        <span class="label-text">Candidate Sign-up Opening Date</span>
        <input class="input" type="datetime-local" name="candidateStart" bind:value={$form.candidateStart} />
      </label>
      <label class="label flex-1">
        <span class="label-text">Candidate Sign-up Ending Date</span>
        <input class="input" type="datetime-local" name="candidateEnd" bind:value={$form.candidateEnd} />
      </label>
    </div>
  </form>
  <div class="grow max-w-full">
    <h4 class="h4">Description Editor</h4>
    <MarkdownEditor {carta} bind:value={$form.description} mode="tabs" />
  </div>
</div>
