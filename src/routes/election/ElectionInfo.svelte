<script lang="ts">
  import { date, humanReadableTimeDiff } from "$lib/client/time.svelte"

  import { getElectionCoverImage } from "$lib/client/store"

  let {
    election,
    size,
  }: {
    election: {
      id: string
      name: string
      imageVersion: number
      start: Date | null
      end: Date | null
      signUpEnd: Date | null
      published: boolean
      membersOnly: boolean
    }
    size?: number
  } = $props()
</script>

<div class="aspect-square w-64">
  <img class="banner-image" src={getElectionCoverImage(election.id, election.imageVersion)} alt="Election Cover" />
</div>
<div class="flex flex-col">
  <h3 class="h3">{election.name}</h3>
  {#if election.membersOnly}
    <span>Members Only</span>
  {/if}
  {#if election.start && election.end && election.signUpEnd}
    {#if date.now < election.signUpEnd}
      <span>
        Sign-ups end in {humanReadableTimeDiff(date.now, election.signUpEnd)}
      </span>
    {/if}
    {#if election.start > date.now}
      <span>
        Election starts in {humanReadableTimeDiff(date.now, election.start)}
      </span>
    {:else if election.end > date.now}
      <span>Voting is Open!</span>
      <span>Election ends in {humanReadableTimeDiff(date.now, election.end)}</span>
    {:else}
      <span>Election is over</span>
    {/if}
  {:else if !election.published}
    <span>Election is unpublished</span>
  {/if}
</div>
