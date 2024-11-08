<script lang="ts">
	import ElectionCard from "$lib/components/ElectionCard.svelte";

	let { data } = $props();
</script>

{#if data.session?.user?.uniID}
	<div class="app-btn-bar">
		<form method="post" action="?/create">
			<button type="submit">Create New Election</button>
		</form>
	</div>
{/if}
{#if data.managedElections.length > 0}
	<h1>Your Elections</h1>
	<div class="election-cards">
		{#each data.managedElections as election}
			<ElectionCard {election} />
		{/each}
	</div>
{/if}

<h1>Elections</h1>

<div class="election-cards">
	{#each data.elections as election}
		<ElectionCard {election} />
	{/each}
</div>

<style>
	.election-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
</style>
