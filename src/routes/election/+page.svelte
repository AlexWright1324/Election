<script lang="ts">
  import { date, humanReadableTimeDiff } from "$lib/client/time.svelte"
  import Card from "$lib/components/Card.svelte"

  import { route } from "$lib/ROUTES"
  import { getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"

  import ElectionInfo from "./ElectionInfo.svelte"
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
  <a
    class={`flex flex-wrap min-w-0 p-2 gap-4 rounded border-surface-800 border-2
    hover:scale-[1.01] transition-all`}
    href={route("/election/[electionID]", { electionID: election.id })}
  >
    <ElectionInfo {election} />
  </a>
{/snippet}

{#snippet Elections(elections: typeof data.elections)}
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
    {#each elections as election}
      {@render ElectionCard(election)}
    {:else}
      <p>No elections found</p>
    {/each}
  </div>
{/snippet}

{#if data.managedElections.length > 0}
  <h2 class="h2">Your Elections</h2>
  {@render Elections(data.managedElections)}
{/if}

<h1 class="h1">Elections</h1>
{@render Elections(data.elections)}
