<script lang="ts">
  import ElectionInfo from "./election/ElectionInfo.svelte"

  import { route } from "$lib/ROUTES"
  import { getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"

  import { getContext } from "svelte"

  let { data } = $props()

  const { enhance: createEnhance } = superForm(getContext("toast"), data.createForm)
</script>

{#snippet ElectionCard(election: (typeof data.elections)[0])}
  <a
    class={`border-surface-800 flex min-w-0 flex-wrap gap-4 rounded border-2 p-2
    transition-all hover:scale-[1.01]`}
    href={route("/election/[electionID]", { electionID: election.id })}
  >
    <div class="banner-image-container w-64">
      <img class="banner-image" src={getElectionCoverImage(election.id, election.imageVersion)} alt="Election Cover" />
    </div>
    <div class="flex flex-col">
      <h2 class="h2">{election.name}</h2>
      <ElectionInfo {election} />
    </div>
  </a>
{/snippet}

{#snippet Elections(elections: typeof data.elections)}
  <div class="grid grid-cols-1 gap-6 p-2 lg:grid-cols-2">
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

<div class="flex flex-wrap items-center justify-between gap-2">
  <h1 class="h1">Elections</h1>
  <form method="post" action="?/create" use:createEnhance>
    <button type="submit" class="btn preset-tonal" disabled={data.session?.user === undefined}>
      Create New Election
    </button>
  </form>
</div>
{@render Elections(data.elections)}
