<script lang="ts">
  import { date, humanReadableTimeDiff } from "$lib/client/time.svelte"

  let {
    election,
  }: {
    election: {
      start: Date | null
      end: Date | null
      nominationsStart: Date | null
      nominationsEnd: Date | null
      membersOnly: boolean
    }
  } = $props()
</script>

<div class="">
  {#if election.start && election.end && election.nominationsStart && election.nominationsEnd}
    {#if date.now < election.nominationsStart}
      <p>
        Sign-ups start in {humanReadableTimeDiff(date.now, election.nominationsStart)}
      </p>
    {:else if date.now < election.nominationsEnd}
      <p>
        Sign-ups end in {humanReadableTimeDiff(date.now, election.nominationsEnd)}
      </p>
    {:else if date.now < election.start}
      <p>
        Election starts in {humanReadableTimeDiff(date.now, election.start)}
      </p>
    {:else if date.now < election.end}
      <p>Election ends in {humanReadableTimeDiff(date.now, election.end)}</p>
      <p class="text-primary-500">Voting is Open!</p>
    {:else}
      <p>Election is over</p>
    {/if}
  {/if}

  {#if election.membersOnly}
    <p class="text-error-300">Members Only</p>
  {/if}
</div>
