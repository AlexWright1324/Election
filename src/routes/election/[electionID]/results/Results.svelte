<script lang="ts">
  import { Accordion } from "@skeletonlabs/skeleton-svelte"
  import { ClipboardList } from "lucide-svelte"

  let {
    roles,
    motions,
  }: {
    roles: {
      name: string
      seatsToFill: number
      result?: PrismaJson.RoleResult
    }[]
    motions: {
      name: string
      result?: PrismaJson.MotionResult
    }[]
  } = $props()
</script>

{#each roles as role}
  {#if role.result !== undefined}
    <div class="preset-outlined-surface-100-900 mb-2 rounded-xl p-2">
      <h3 class="h3">{role.name}</h3>
      <p>Seats to fill: {role.seatsToFill}</p>
      <h4 class="h4">Winners</h4>
      {#each role.result.winners as winner}
        <p>{winner.name}</p>
      {/each}

      <Accordion classes="" collapsible>
        <Accordion.Item value="Round">
          {#snippet lead()}<ClipboardList size={24} />{/snippet}
          {#snippet control()}Rounds{/snippet}
          {#snippet panel()}
            {#if role.result !== undefined}
              <p>Droop Quota: {role.result.droopQuota}</p>
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
                    {#each role.result.rounds as round, index}
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
            {/if}
          {/snippet}
        </Accordion.Item>
      </Accordion>
    </div>
  {/if}
{:else}
  <p>No roles</p>
{/each}

{#if motions.length > 0}
  <h2 class="h2">Motions</h2>
  {#each motions as motion}
    {#if motion.result}
      <div class="preset-outlined-surface-100-900 mb-2 rounded-xl p-2">
        <h3 class="h3">{motion.name}</h3>
        <ul>
          <li><p>For: {motion.result.for}</p></li>
          <li><p>Against: {motion.result.against}</p></li>
          <li><p>Abstain: {motion.result.abstain}</p></li>
        </ul>
        {#if motion.result.for > motion.result.against}
          <p>Motion Passed</p>
        {:else if motion.result.for < motion.result.against}
          <p>Motion Failed</p>
        {:else}
          <p>Motion Tied</p>
        {/if}
      </div>
    {/if}
  {/each}
{/if}
