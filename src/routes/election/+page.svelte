<script lang="ts">
  import { enhance } from "$app/forms"
  
  import { getElectionCoverImage } from "$lib/client/store"
  import { formatTimeDiff, currentDateTime } from "$lib/client/time.svelte"
  import Card from "$lib/components/Card.svelte"
  import { Tooltip } from "@skeletonlabs/skeleton-svelte"

  let { data } = $props()
</script>

<Tooltip contentBase="card preset-filled-surface-500 p-2 {data.session?.user === undefined ? "" : "hidden"}" openDelay={50}>
  {#snippet trigger()}
    <form method="post" action="?/create" use:enhance>
      <button type="submit" class="btn preset-tonal" disabled={data.session?.user === undefined}>Create New Election</button>
    </form>
  {/snippet}
  {#snippet content()}
    <p>You must be logged in to create an election.</p>
  {/snippet}
</Tooltip>

{#snippet ElectionCard(election: typeof data.elections[0])}
  <Card href="/election/{election.id}" image={getElectionCoverImage(election.id)}>
    <h3 class="h3">{election.name}</h3>
    {#snippet footer()}
      {election.start}
      {#if election.candidateStart && election.candidateEnd}
        {#if election.candidateStart > currentDateTime.value}
          <p>
            Candidate signups start in {formatTimeDiff(election.candidateStart, currentDateTime.value)}
          </p>
        {:else if election.candidateEnd > currentDateTime.value}
          <p>
            Candidate signups end in {formatTimeDiff(election.candidateEnd, currentDateTime.value)}
          </p>
        {/if}
      {/if}
      {#if election.start && election.end}
        {#if election.start > currentDateTime.value}
          <p>
            Election starts in {formatTimeDiff(election.start, currentDateTime.value)}
          </p>
        {:else if election.end > currentDateTime.value}
          <p>
            Election ends in {formatTimeDiff(election.end, currentDateTime.value)}
          </p>
        {:else}
          <p>Election is over</p>
        {/if}
      {/if}
    {/snippet}
  </Card>
{/snippet}

{#if data.managedElections.length > 0}
  <h2 class="h2">Your Elections</h2>
  <div>
    {#each data.managedElections as election}
    {@render ElectionCard(election)}
    {/each}
  </div>
{/if}

<h1 class="h1">Elections</h1>

<div class="election-cards">
  {#each data.elections as election}
    {@render ElectionCard(election)}
  {/each}
</div>
