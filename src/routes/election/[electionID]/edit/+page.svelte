<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { getElectionCoverImage } from "$lib/client/store"

  import { MarkdownEditor } from "carta-md"
  import { superForm } from "sveltekit-superforms"
  import UnsavedModal, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"
  import DeleteModal from "$lib/components/modals/Delete.svelte"
  import CrossTickSwitch from "$lib/components/switches/CrossTickSwitch.svelte"

  let { data } = $props()

  let coverImgSrc = $state(getElectionCoverImage(data.election.id))

  const { form, enhance, isTainted, tainted } = superForm(data.updateForm, {
    resetForm: false,
    onUpdated: () => {
      coverImgSrc = getElectionCoverImage(data.election.id)
    },
    taintedMessage,
  })
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
    <div class="grow max-w-full">
      <label class="label">
        <span class="label-text">Description</span>
        <input type="hidden" name="description" bind:value={$form.description} />
        <MarkdownEditor {carta} bind:value={$form.description} mode="tabs" />
      </label>
    </div>
    <div>
      <h4 class="h4">Candidate Settings</h4>
      <label class="label">
        <span class="label-text">Max Users in a Candidancy</span>
        <input class="input" type="number" name="maxCandidates" bind:value={$form.candidateMaxUsers} />
      </label>
      <label class="label">
        <span class="label-text">Max Characters in Candidate Description</span>
        <input class="input" type="number" name="maxDescription" bind:value={$form.candidateMaxDescription} />
      </label>
      <label class="label">
        <span class="label-text">Candidate Default Description</span>
        <input type="hidden" name="candidateDefaultDescription" bind:value={$form.candidateDefaultDescription} />
        <MarkdownEditor {carta} bind:value={$form.candidateDefaultDescription} mode="tabs" />
      </label>
    </div>
    <div>
      <h4 class="h4">Motion Settings</h4>
      <label class="label">
        <span class="label-text">Motions Enabled</span>
        <CrossTickSwitch name="motionEnabled" bind:checked={$form.motionEnabled} />
      </label>
      <label class="label">
        <span class="label-text">Max Characters in Motion Description</span>
        <input class="input" type="number" name="maxMotionDescription" bind:value={$form.motionMaxDescription} />
      </label>
      <label class="label">
        <span class="label-text">Max Seconders</span>
        <input class="input" type="number" name="maxSeconders" bind:value={$form.motionMaxSeconders} />
      </label>
      <label class="label">
        <span class="label-text">Motion Default Description</span>
        <input type="hidden" name="motionDefaultDescription" bind:value={$form.motionDefaultDescription} />
        <MarkdownEditor {carta} bind:value={$form.motionDefaultDescription} mode="tabs" />
      </label>
    </div>
  </form>
</div>
