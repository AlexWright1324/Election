<script lang="ts">
	import { superForm } from "sveltekit-superforms"

	let { data } = $props()

	const { form: newElectionForm } = superForm(data.newElectionForm)
</script>

<h1>New Election</h1>

<form method="post" action="/e/new">
	<label for="name">Election Name</label>
	<input type="text" name="name" bind:value={$newElectionForm.name} required />
	<button type="submit">Create Election</button>
</form>
