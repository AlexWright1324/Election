<script lang="ts">
  import { getElectionCoverImage } from "$lib/client/store"
  import { formatTimeDiff, currentDateTime } from "$lib/client/time.svelte"
  import Card from "$lib/components/Card.svelte"
  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  const { enhance: createElectionEnhance, errors: createElectionErrors } = superForm(data.createElectionForm)
</script>

<form class="flex" method="post" action="?/create" use:createElectionEnhance>
  <button type="submit" class="btn preset-tonal" disabled={data.user === undefined}>
    Create New Election
  </button>
  {#if $createElectionErrors}
    <p class="text-error-500">{$createElectionErrors._errors}</p>
  {/if}
</form>

{#snippet ElectionCard(election: (typeof data.elections)[0])}
  <Card href="/election/{election.id}" image={getElectionCoverImage(election.id)}>
    <h3 class="h3">{election.name}</h3>
    {#snippet footer()}
      {election.start}
      {#if election.signUpEnd}
        {#if currentDateTime.value < election.signUpEnd}
          <p>
            Sign-ups end in {formatTimeDiff(election.signUpEnd, currentDateTime.value)}
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
