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
{/if}
{#each data.managedElections as election}
	<ElectionCard {election} />
{/each}

<h1>Elections</h1>

<ul>
	{#each data.elections as election}
		<li>
			<ElectionCard {election} />
		</li>
	{/each}
</ul>
