<script lang="ts">
  import { date, humanReadableTimeDiff } from "$lib/client/time.svelte"
  import Card from "$lib/components/Card.svelte"

  import { carta } from "$lib/client/carta"
  import { seperateJoin } from "$lib/client/separate"
  import { getCandidateCoverImage, getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"

  import ElectionInfo from "../ElectionInfo.svelte"
  import { Markdown } from "carta-md"
  import { getContext } from "svelte"

  const { data } = $props()

  const { enhance: candidateSignupEnhance } = superForm(getContext("toast"), data.candidateSignupForm)
  const { enhance: createMotionEnhance } = superForm(getContext("toast"), data.createMotionForm)
</script>

<h1 class="h1">{data.election.name}</h1>

<article class="flex flex-wrap gap-x-4">
  <div class="max-w-xs mb-2">
    <ElectionInfo election={data.election} />
  </div>
  <Markdown {carta} value={data.election.description} />
</article>

<hr class="hr mt-2" />

<h2 class="h2">Roles</h2>
{#each data.election.roles as role}
  <div class="flex flex-wrap justify-between items-center gap-x-2">
    <h3 class="h3">{role.name}</h3>
    {#if !role.candidates.some((c) => c.users.some((u) => u))}
      <form action="?/candidateSignup" method="post" use:candidateSignupEnhance>
        <input type="hidden" name="roleID" value={role.id} />
        <button class="btn preset-tonal-primary" type="submit">Become a Candidate</button>
      </form>
    {/if}
  </div>
  {#each role.candidates as candidate}
    <Card href="/candidate/{candidate.id}" image={getCandidateCoverImage(data.election.id, candidate.id)}>
      {seperateJoin(candidate.users.map((u) => u.name))}
    </Card>
  {:else}
    <p>No Candidates</p>
  {/each}
{:else}
  <p>No Roles</p>
{/each}

<hr class="hr mt-2" />

{#if data.election.motionEnabled}
  <div class="flex flex-wrap justify-between items-center gap-x-2">
    <h2 class="h2">Motions</h2>
    <form action="?/createMotion" method="post" use:createMotionEnhance>
      <button class="btn preset-tonal-primary" type="submit">Create a Motion</button>
    </form>
  </div>
  <ul>
    {#each data.election.motions as motion}
      <li>
        <a href="/motion/{motion.id}">
          {motion.name}
        </a>
      </li>
    {:else}
      <p>No Motions</p>
    {/each}
  </ul>
{/if}
