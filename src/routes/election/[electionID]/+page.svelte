<script lang="ts">
  import { Markdown } from "carta-md"
  import { carta } from "$lib/client/carta"
  import ElectionCard from "$lib/components/ElectionCard.svelte"
  import CandidateCard from "$lib/components/CandidateCard.svelte"
  let { data } = $props()
</script>

<div class="election-page">
  <ElectionCard election={data.election} link={false} />

  <div class="election-page-content">
    <Markdown {carta} value={data.election.description} />
  </div>
</div>

<h1>Candidates</h1>
{#each data.election.roles as role}
  <h2>{role.name}</h2>
  {#if role.candidates.some((c) => c.users.some((u) => u))}
    <p>You are already a candidate for this role</p>
  {:else}
    <form action="/election/{data.election.id}/candidate?/signup" method="POST">
      <input type="hidden" name="roleID" value={role.id} />
      <button class="app-btn">Become a Candidate</button>
    </form>
  {/if}
  {#each role.candidates as candidate}
    <CandidateCard {candidate} href="/election/{data.election.id}/candidate/{candidate.id}" />
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
