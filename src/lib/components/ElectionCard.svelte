<script lang="ts">
    import { getElectionCoverImage } from "$lib/client/election";
    import { formatTimeDiff } from "$lib/client/time";
    import type { Election } from "@prisma/client";

    let {
        election,
        currentDateTime,
    }: { election: Election; currentDateTime: Date } = $props();
</script>

<a href="/election/{election.id}">
    <img
        src={getElectionCoverImage(election.id)}
        alt="Election Cover"
        width="250"
    />
    <h3>{election.name}</h3>
    {#if election.candidateStart && election.candidateEnd}
        {#if election.candidateStart > currentDateTime}
            <p>
                Candidate signups start in {formatTimeDiff(
                    election.candidateStart,
                    currentDateTime,
                )}
            </p>
        {:else if election.candidateEnd > currentDateTime}
            <p>
                Candidate signups end in {formatTimeDiff(
                    election.candidateEnd,
                    currentDateTime,
                )}
            </p>
        {/if}
    {/if}
    {#if election.start && election.end}
        {#if election.start > currentDateTime}
            <p>
                Election starts in {formatTimeDiff(
                    election.start,
                    currentDateTime,
                )}
            </p>
        {:else if election.end > currentDateTime}
            <p>
                Election ends in {formatTimeDiff(election.end, currentDateTime)}
            </p>
        {:else}
            <p>Election is over</p>
        {/if}
    {/if}
</a>
