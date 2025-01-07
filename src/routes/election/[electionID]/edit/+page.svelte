<script lang="ts">
    import { carta } from "$lib/client/carta";
    import { getElectionCoverImage } from "$lib/client/election";

    import { MarkdownEditor } from "carta-md";
    import { superForm } from "sveltekit-superforms";

    let { data } = $props();

    let coverImgSrc = $state(getElectionCoverImage(data.election.id));

    const { form: updateForm, enhance: updateEnhance } = superForm(
        data.updateForm,
        {
            resetForm: false,
            onUpdated: () => {
                coverImgSrc = getElectionCoverImage(data.election.id);
            },
        },
    );
</script>

<form
    method="post"
    action="?/update"
    enctype="multipart/form-data"
    use:updateEnhance
    class="app-form"
>
    <button type="submit" class="app-btn">Update Election</button>
    <input
        type="hidden"
        name="description"
        bind:value={$updateForm.description}
    />
    <h2>Title</h2>
    <input type="text" name="name" bind:value={$updateForm.name} />
    <h2>Cover Image</h2>
    <input type="file" name="image" accept="image/*" />
    <h2>Start Date</h2>
    <input type="datetime-local" name="start" bind:value={$updateForm.start} />
    <h2>End Date</h2>
    <input type="datetime-local" name="end" bind:value={$updateForm.end} />
    <h2>Candidate Start Date</h2>
    <input type="datetime-local" name="candidateStart" bind:value={$updateForm.candidateStart} />
    <h2>Candidate End Date</h2>
    <input type="datetime-local" name="candidateEnd" bind:value={$updateForm.candidateEnd} />
    <h2>Published</h2>
    <input type="checkbox" name="published" bind:checked={$updateForm.published} />
</form>

<img id="cover-image" src={coverImgSrc} alt="Election Cover" />

<h2>Description Editor</h2>
<MarkdownEditor {carta} bind:value={$updateForm.description} mode="tabs" />

<form method="post" action="?/delete" >
    <button type="submit" class="app-btn red">Delete Election</button>
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
