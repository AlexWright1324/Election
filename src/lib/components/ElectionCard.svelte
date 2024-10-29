<script lang="ts">
    import { getElectionCoverImage } from "$lib/client/election";
    import { formatTimeDiff, currentDateTime } from "$lib/client/time.svelte";
    import type { Election } from "@prisma/client";
    import { onMount } from "svelte";

    let {
        election,
        link = true,
    }: {
        election: Election;
        link?: boolean;
    } = $props();

    onMount(() => {
        const interval = setInterval(() => {
            console.log("Updating time");
            currentDateTime.value = new Date();
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    let href = link ? `/election/${election.id}` : undefined;
</script>

<a {href} class="card" class:link>
    <img src={getElectionCoverImage(election.id)} alt="Election Cover" />
    <div>
        <h3>{election.name}</h3>
        {#if election.candidateStart && election.candidateEnd}
            {#if election.candidateStart > currentDateTime.value}
                <p>
                    Candidate signups start in {formatTimeDiff(
                        election.candidateStart,
                        currentDateTime.value,
                    )}
                </p>
            {:else if election.candidateEnd > currentDateTime.value}
                <p>
                    Candidate signups end in {formatTimeDiff(
                        election.candidateEnd,
                        currentDateTime.value,
                    )}
                </p>
            {/if}
        {/if}
        {#if election.start && election.end}
            {#if election.start > currentDateTime.value}
                <p>
                    Election starts in {formatTimeDiff(
                        election.start,
                        currentDateTime.value,
                    )}
                </p>
            {:else if election.end > currentDateTime.value}
                <p>
                    Election ends in {formatTimeDiff(
                        election.end,
                        currentDateTime.value,
                    )}
                </p>
            {:else}
                <p>Election is over</p>
            {/if}
        {/if}
    </div>
</a>

<style>
    .card {
        width: 100%;
        max-width: 300px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;

        & > div {
            display: flex;
            flex-direction: column;
            padding: 0.5rem;
        }

        & > img {
            width: 100%;
        }
    }
    
    .link {
        overflow: hidden;
        max-width: 250px;
        height: 450px;
        border-radius: 20px;
        border: 2px solid var(--app-color-3);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        transition: transform 0.1s ease-in-out;

        &:hover {
            transform: scale(1.01);
        }
    }
</style>
