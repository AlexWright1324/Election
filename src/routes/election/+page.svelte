<script lang="ts">
	import ElectionCard from "$lib/components/ElectionCard.svelte";

	let { data } = $props();
</script>

{#if data.session?.user?.uniID}
	<form method="post" action="?/create">
		<button type="submit" class="btn preset-tonal">Create New Election</button>
	</form>
{/if}
{#if data.managedElections.length > 0}
	<h2 class="h2">Your Elections</h2>
	<div>
		{#each data.managedElections as election}
			<ElectionCard {election} />
		{/each}
	</div>
{/if}

<h1 class="h1">Elections</h1>

<div class="election-cards">
	{#each data.elections as election}
		<ElectionCard {election} />
	{/each}
</div>