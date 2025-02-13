<script lang="ts">
  import { date, humanReadableTimeDiff } from "$lib/client/time.svelte"
  import Card from "$lib/components/Card.svelte"

  import { getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"

  import { getContext } from "svelte"

  let { data } = $props()

  const { enhance: createEnhance } = superForm(getContext("toast"), data.createForm)
</script>

<form method="post" action="?/create" use:createEnhance>
  <button type="submit" class="btn preset-tonal" disabled={data.session?.user === undefined}>
    Create New Election
  </button>
</form>

{#snippet ElectionCard(election: (typeof data.elections)[0])}
  <Card href="/election/{election.id}" image={getElectionCoverImage(election.id)}>
    <h3 class="h3">{election.name}</h3>
    {#snippet footer()}
      <div>
        {#if election.start && election.end && election.signUpEnd}
          {#if date.now < election.signUpEnd}
            <p>
              Sign-ups end in {humanReadableTimeDiff(date.now, election.signUpEnd)}
            </p>
          {/if}
          {#if election.start > date.now}
            <p>
              Election starts in {humanReadableTimeDiff(date.now, election.start)}
            </p>
          {:else if election.end > date.now}
            <p>
              Voting is open! Election ends in {humanReadableTimeDiff(date.now, election.end)}
            </p>
          {:else}
            <p>Election is over</p>
          {/if}
        {/if}
      </div>
    {/snippet}
  </Card>
{/snippet}

{#if data.managedElections.length > 0}
  <h2 class="h2">Your Elections</h2>
  <div class="flex gap-2">
    {#each data.managedElections as election}
      {@render ElectionCard(election)}
    {/each}
  </div>
{/if}

<h1 class="h1">Elections</h1>

<div class="flex gap-2">
  {#each data.elections as election}
    {@render ElectionCard(election)}
  {/each}
</div>
