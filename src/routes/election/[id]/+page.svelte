<script lang="ts">
	import { Markdown } from "carta-md";
	import { carta } from "$lib/client/carta";
    import ElectionCard from "$lib/components/ElectionCard.svelte";
    import CandidateCard from "$lib/components/CandidateCard.svelte";
	let { data } = $props();
</script>

<div class="election-page">
	<ElectionCard election={data.election} link={false} />
	
	<div class="election-page-content">
		<Markdown {carta} value={data.election.description} />
	</div>
</div>

<h1>Candidates</h1>
{#each data.election.roles as role}
	{@const link=`/election/${data.election.id}/role/${role.id}`}
	<h2>{role.name}</h2>
	<form action={link} method="POST">
		<button class="app-btn">Become a Candidate</button>
	</form>
	{#each role.candidates as candidate}
		<CandidateCard {candidate} href={`${link}/candidate/${candidate.id}`}/>
	{:else}
		<p>No Candidates</p>
	{/each}
{:else}
	<p>No Roles</p>
{/each}

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