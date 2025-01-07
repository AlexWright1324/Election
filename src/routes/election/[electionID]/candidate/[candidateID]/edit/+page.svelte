<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { getElectionCoverImage } from "$lib/client/election"

  import { MarkdownEditor } from "carta-md"
  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  let coverImgSrc = $state(getElectionCoverImage(data.election.id))

  const { form, enhance, isTainted, tainted } = superForm(data.editForm, {
    resetForm: false,
    onUpdated: () => {
      coverImgSrc = getElectionCoverImage(data.election.id)
    },
    taintedMessage: async () => {
      return confirm("You have unsaved changes. Are you sure you want to leave?")
    },
  })
</script>

<form method="post" action="?/update" enctype="multipart/form-data" use:enhance class="app-form">
  {#if isTainted($tainted)}
    <button type="submit" class="app-btn">Update Candidate Page</button>
  {/if}
  <input type="hidden" name="description" bind:value={$form.description} />
  <h2>Name</h2>
  <input type="text" name="name" bind:value={$form.name} />
  <h2>Cover Image</h2>
  <input type="file" name="image" accept="image/*" bind:value={$form.image} />
</form>

<img id="cover-image" src={coverImgSrc} alt="Election Cover" />

<h2>Description Editor</h2>
<MarkdownEditor {carta} bind:value={$form.description} mode="tabs" />

<form method="post" action="?/delete">
  <button type="submit" class="app-btn red">Delete Candidate</button>
</form>

<style>
  #cover-image {
    width: 250px;
  }
  .app-form {
    display: flex;
    flex-direction: column;
  }
  button {
    text-align: center;
  }
  .red {
    background-color: rgb(100, 20, 20);
  }
</style>
