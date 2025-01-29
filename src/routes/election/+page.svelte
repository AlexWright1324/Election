<script lang="ts">
  import { enhance } from "$app/forms"
  
  import ElectionCard from "$lib/components/ElectionCard.svelte"
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

{#if data.managedElections.length > 0}
  <h2 class="h2">Your Elections</h2>
  <div>
    {#each data.managedElections as election}
      <ElectionCard {election} />
    {/each}
  </div>
{/if}

<h1 class="h1">Elections</h1>

<div class="election-cards">
  {#each data.elections as election}
    <ElectionCard {election} />
  {/each}
</div>
