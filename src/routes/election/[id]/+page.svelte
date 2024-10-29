<script lang="ts">
	import { Markdown } from "carta-md";
	import { carta } from "$lib/client/carta";
    import ElectionCard from "$lib/components/ElectionCard.svelte";
	let { data } = $props();
</script>

{#if data.admin}
	<div class="app-btn-bar">
		<p style="font-weight: bold">Admin</p>
		<a href="/election/{data.election.id}/edit">Edit Election</a>
	</div>
{/if}

<div class="election-page">
	<ElectionCard election={data.election} link={false} />
	
	<div class="election-page-content">
		<Markdown {carta} value={data.election.description} />
	</div>
</div>

h1

<form method="post">
	<h1>Be a Candidate</h1>
	<label for="role">Roles</label>
	<select name="role">
		{#each data.election.roles as role}
		<option value={role.id}>{role.name}</option>
		{/each}
	</select>
</form>

<style>
	.election-page {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;

		> .election-page-content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
		}
	}
</style>