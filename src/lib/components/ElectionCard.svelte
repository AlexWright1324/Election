<script lang="ts">
  import { getElectionCoverImage } from "$lib/client/store"
  import { formatTimeDiff, currentDateTime } from "$lib/client/time.svelte"
  import Card from "$lib/components/Card.svelte"
  import type { Election } from "@prisma/client"
  import { onMount } from "svelte"

  let {
    election,
    link = true,
  }: {
    election: Election
    link?: boolean
  } = $props()

  onMount(() => {
    const interval = setInterval(() => {
      console.log("Updating time")
      currentDateTime.value = new Date()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })

  let href = link ? `/election/${election.id}` : undefined
</script>

<Card {href} image={getElectionCoverImage(election.id)}>
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
