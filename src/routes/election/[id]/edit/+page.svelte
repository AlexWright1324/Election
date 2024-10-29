<script lang="ts">
    import { carta } from "$lib/client/carta";
    import { getElectionCoverImage } from "$lib/client/election.js";

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
</form>

<img id="cover-image" src={coverImgSrc} alt="Election Cover" />

<h2>Description Editor</h2>
<MarkdownEditor {carta} bind:value={$updateForm.description} mode="tabs" />

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
</style>
