<script lang="ts">
  import { Markdown } from "carta-md"

  import { getCandidateCoverImage, getElectionCoverImage } from "$lib/client/store"
  import { seperateJoin } from "$lib/client/separate"
  import { carta } from "$lib/client/carta"

  import Card from "$lib/components/Card.svelte"
  let { data } = $props()
</script>

<h1 class="h1">{data.election.name}</h1>
<article>
  <aside>
    <img src={getElectionCoverImage(data.election.id)} alt="Election Banner" />
  </aside>
  <main>
    <Markdown {carta} value={data.election.description} />
  </main>
</article>

<h2 class="h2">Candidates</h2>
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
    <Card
      href="/election/{data.election.id}/candidate/{candidate.id}"
      image={getCandidateCoverImage(data.election.id, candidate.id)}
    >
      <h3>{candidate.name}</h3>
      {#if candidate.users.length > 1}
        {#snippet footer()}
          {seperateJoin(candidate.users.map((u) => u.name))}
        {/snippet}
      {/if}
    </Card>
  {:else}
    <p>No Candidates</p>
  {/each}
{:else}
  <p>No Roles</p>
{/each}

<style lang="postcss">
  article {
    @apply flex flex-wrap gap-4;
    > aside {
      @apply w-full max-w-xs;
    }
    > main {
      @apply flex-1;
    }
  }
</style>
