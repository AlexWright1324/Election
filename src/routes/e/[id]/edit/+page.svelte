<script lang="ts">
import { MarkdownEditor } from "carta-md"
import { carta } from "$lib/client/carta"
import { superForm } from "sveltekit-superforms"

let { data } = $props()

const { form: electionUpdateForm } = superForm(data.electionUpdateForm)
</script>

<h1>{data.election.name}</h1>
<form method="post">
    <input
        type="hidden"
        name="description"
        bind:value={$electionUpdateForm.description}
    />
    <button type="submit">Save</button>
</form>

<MarkdownEditor {carta} bind:value={$electionUpdateForm.description} />
