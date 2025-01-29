<script lang="ts">
  import { Markdown } from "carta-md"

  import Card from "$lib/components/Card.svelte"
  import { getCandidateCoverImage, getElectionCoverImage } from "$lib/client/store"
  import { seperateJoin } from "$lib/client/separate"
  import { carta } from "$lib/client/carta"

  let { data } = $props()
</script>

<h1 class="h1">{data.election.name}</h1>

<article class="flex flex-wrap gap-x-4">
  <div class="max-w-xs mb-2">
    <img src={getElectionCoverImage(data.election.id)} alt="Election Banner" />
  </div>
  <Markdown {carta} value={data.election.description} />
</article>

<hr class="hr" />

<h2 class="h2">Candidates</h2>
{#each data.election.roles as role}
  <h3 class="h3">{role.name}</h3>
  {#if role.candidates.some((c) => c.users.some((u) => u))}
    <p>You are already a candidate for this role</p>
  {:else}
    <form action="/election/{data.election.id}/candidate?/signup" method="POST">
      <input type="hidden" name="roleID" value={role.id} />
      <button class="btn preset-tonal-primary">Become a Candidate</button>
    </form>
  {/if}
  {#each role.candidates as candidate}
    <Card
      href="/election/{data.election.id}/candidate/{candidate.id}"
      image={getCandidateCoverImage(data.election.id, candidate.id)}
    >
      {seperateJoin(candidate.users.map((u) => u.name))}
    </Card>
  {:else}
    <p>No Candidates</p>
  {/each}
{:else}
  <p>No Roles</p>
{/each}
