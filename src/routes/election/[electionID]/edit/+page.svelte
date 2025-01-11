<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { getElectionCoverImage } from "$lib/client/store"

  import { Modal, Switch } from "@skeletonlabs/skeleton-svelte"
  import { X, Check } from "lucide-svelte"

  import { MarkdownEditor } from "carta-md"
  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  let coverImgSrc = $state(getElectionCoverImage(data.election.id))

  let modalResolve = $state<(value: boolean | PromiseLike<boolean>) => void>()
  let modalOpen = $state(false)
  let deleteModalOpen = $state(false)

  const { form, enhance, isTainted, tainted } = superForm(data.updateForm, {
    resetForm: false,
    onUpdated: () => {
      coverImgSrc = getElectionCoverImage(data.election.id)
    },
    taintedMessage: () => {
      return new Promise((resolve) => {
        modalOpen = true
        modalResolve = resolve
      })
    },
  })

  let unsaved = $derived(isTainted($tainted))
</script>

<Modal bind:open={modalOpen} triggerBase="hidden" contentBase="card bg-surface-100-900 shadow-xl max-w-sm w-full p-4">
  {#snippet content()}
    <header class="flex justify-between">
      <h2 class="h2">Unsaved Changes</h2>
    </header>
    <article>
      <p>Are you sure you want to leave?</p>
    </article>
    <footer class="flex justify-between mt-4">
      <button type="button" class="btn preset-tonal" onclick={() => (modalOpen = false)}>Cancel</button>
      <button type="button" class="btn preset-filled-error-500" onclick={() => modalResolve?.(true)}
        >Discard Changes</button
      >
    </footer>
  {/snippet}
</Modal>

<div class="flex flex-wrap gap-2">
  <button form="update" type="submit" class="btn preset-filled-primary-500" disabled={!unsaved}>Update Election</button>

  <Modal bind:open={deleteModalOpen}>
    {#snippet trigger()}
      <button type="button" class="btn preset-filled-error-500">Delete Election</button>
    {/snippet}
    {#snippet content()}
      <header class="flex justify-between">
        <h2 class="h2">Delete Election</h2>
      </header>
      <article>
        <p>Are you sure you want to delete this election?</p>
      </article>
      <footer class="flex justify-between mt-4">
        <button type="button" class="btn preset-tonal" onclick={() => (deleteModalOpen = false)}>Cancel</button>
        <form method="post" action="?/delete">
          <button type="submit" class="btn preset-filled-error-500">Delete Election</button>
        </form>
      </footer>
    {/snippet}
  </Modal>
</div>

<div class="flex flex-wrap gap-4">
  <form id="update" method="post" action="?/update" enctype="multipart/form-data" use:enhance class="flex-1 gap-4">
    <input type="hidden" name="description" bind:value={$form.description} />
    <div class="flex flex-wrap gap-4 p-4">
      <p>Published</p>
      <Switch name="published" bind:checked={$form.published}>
        {#snippet inactiveChild()}
          <X size="1em" />
        {/snippet}
        {#snippet activeChild()}
          <Check size="1em" />
        {/snippet}
      </Switch>
    </div>
    <label class="label">
      <span class="label-text">Title</span>
      <input class="input" type="text" name="name" bind:value={$form.name} />
    </label>

    <img class="p-4" src={coverImgSrc} alt="Election Cover" />
    <label class="label">
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

  <div class="flex-[2]">
    <h4 class="h4">Description Editor</h4>
    <MarkdownEditor {carta} bind:value={$form.description} mode="tabs" />
  </div>
</div>
