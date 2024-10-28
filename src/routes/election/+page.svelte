<script lang="ts">
	import { formatTimeDiff } from "$lib/client/time";
	import { getElectionCoverImage } from "$lib/client/election.js";
	import ElectionCard from "$lib/components/ElectionCard.svelte";

	import { onMount } from "svelte";

	let currentDateTime = $state(new Date());

	onMount(() => {
		const interval = setInterval(() => {
			currentDateTime = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	let { data } = $props();
</script>

{#if data.managedElections.length > 0}
	<h1>Your Elections</h1>
{/if}
{#each data.managedElections as election}
	<ElectionCard {election} {currentDateTime} />
{/each}

<h1>Elections</h1>
<div class="app-btn-bar">
	<form method="post" action="?/create">
		<button class="app-btn">Create New Election</button>
	</form>
</div>

<ul>
	{#each data.elections as election}
		<li>
			<ElectionCard {election} {currentDateTime} />
		</li>
	{/each}
</ul>
