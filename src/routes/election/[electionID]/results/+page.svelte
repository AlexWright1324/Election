<script lang="ts">
  import { route } from "$lib/ROUTES"

  import { Accordion } from "@skeletonlabs/skeleton-svelte"
  import { ClipboardList } from "lucide-svelte"

  let { data } = $props()
</script>

<a
  class="btn preset-filled-primary-500"
  href={route("GET /election/[electionID]/results/proof", { electionID: data.election.id })}
  download
>
  Download Proof of Election
</a>

<!-- TODO: Display current state of election -->
<!-- TODO: Publish Results Button -->

<p>Votes: {data.numVotes}</p>

<h1 class="h1">Results</h1>
{#each data.results.roles as roleResult}
  <h1 class="h1">{roleResult.name}</h1>
  <p>Seats to fill: {roleResult.seatsToFill}</p>
  <h2 class="h2">Winners</h2>
  {#each roleResult.winners as winner}
    <p>{winner.name}</p>
  {/each}
  <h3 class="h3">Rounds</h3>
  <p>Droop Quota: {roleResult.droopQuota}</p>

  <Accordion classes="" collapsible>
    <Accordion.Item value="Round">
      {#snippet lead()}<ClipboardList size={24} />{/snippet}
      {#snippet control()}Round Data{/snippet}
      {#snippet panel()}
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th class="!text-right">Tally</th>
              </tr>
            </thead>
            <tbody>
              {#each roleResult.rounds as round, index}
                <tr>
                  <td class="preset-tonal text-center" colspan="3">Round {index + 1}</td>
                </tr>
                {#each round.candidates as candidate}
                  <tr>
                    <td>{candidate.name}</td>
                    <td>
                      {#if candidate.status === "winner"}
                        Winner
                      {:else if candidate.status === "eliminated"}
                        Eliminated
                      {:else}
                        Running
                      {/if}
                    </td>
                    <td class="text-right">
                      {#if candidate.tally}
                        {candidate.tally}
                      {:else}
                        N/A
                      {/if}
                    </td>
                  </tr>
                {/each}
              {/each}
            </tbody>
          </table>
        </div>
      {/snippet}
    </Accordion.Item>
  </Accordion>
{:else}
  <p>No roles!</p>
{/each}

<h2 class="h2">Motions</h2>
{#each data.results.motions as motionResult}
  <h1 class="h1">{motionResult.name}</h1>
  <ul>
    <li><p>For: {motionResult.results.for}</p></li>
    <li><p>Against: {motionResult.results.against}</p></li>
    <li><p>Abstain: {motionResult.results.abstain}</p></li>
  </ul>
  {#if motionResult.results.for > motionResult.results.against}
    <p>Motion Passed</p>
  {:else if motionResult.results.for < motionResult.results.against}
    <p>Motion Failed</p>
  {:else}
    <p>Motion Tied</p>
  {/if}
{:else}
  <p>No motions</p>
{/each}
