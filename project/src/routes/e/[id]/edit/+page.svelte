<script lang="ts">
    import { Carta, MarkdownEditor } from 'carta-md';
    import DOMPurify from 'isomorphic-dompurify';
    import { superForm } from "sveltekit-superforms"
    const carta = new Carta({
        sanitizer: DOMPurify.sanitize
	});
    
	let { data } = $props()
    
    const { form: electionUpdateForm } = superForm(data.electionUpdateForm)
</script>

<h1>{data.election.name}</h1>
<form method="post">
    <input type="hidden" name="description" bind:value={$electionUpdateForm.description} />
    <button type="submit">Save</button>
</form>

<MarkdownEditor {carta} bind:value={$electionUpdateForm.description}/>