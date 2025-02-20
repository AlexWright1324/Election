<script lang="ts">
  import Card from "$lib/components/Card.svelte"
  import DisableAnchor from "$lib/components/DisableAnchor.svelte"

  import { route } from "$lib/ROUTES"
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
  <div class="mb-2 max-w-xs">
    <div class="banner-image-container">
      <img
        class="banner-image"
        src={getElectionCoverImage(data.election.id, data.election.imageVersion)}
        alt="Election Cover"
      />
    </div>
    <ElectionInfo election={data.election} />
    <DisableAnchor
      aClass="w-full"
      href={route("/election/[electionID]/vote", { electionID: data.election.id })}
      disables={[
        { disabled: !data.session, text: "Login to Vote" },
        { disabled: data.election.membersOnly && !data.election.isMember, text: "Members Only" },
        { disabled: !(data.election.start && data.election.end), text: "" },
        { disabled: data.election.start! > new Date(Date.now()), text: "" },
        { disabled: data.election.end! < new Date(Date.now()), text: "" },
        { disabled: data.election.voted, text: "Already Voted" },
      ]}
    >
      Vote
    </DisableAnchor>
  </div>
  <Markdown {carta} value={data.election.description} />
</article>

<hr class="hr mt-2" />

<h2 class="h2">Roles</h2>
{#each data.election.roles as role}
  <div class="flex flex-wrap items-center justify-between gap-x-2">
    <h3 class="h3">{role.name}</h3>
    {#if !role.candidates.some((c) => c.users.some((u) => u)) && data.election.canSignup}
      <form action="?/candidateSignup" method="post" use:candidateSignupEnhance>
        <input type="hidden" name="roleID" value={role.id} />
        <button class="btn preset-tonal-primary" type="submit">Become a Candidate</button>
      </form>
    {/if}
  </div>
  {#if role.seatsToFill > 1}
    <p class="text-primary-500">{role.seatsToFill} Seats to fill</p>
  {/if}
  <div class="divide-y-2 divide-surface-500">
    {#each role.candidates as candidate}
      <a
        href={route("/candidate/[candidateID]", { candidateID: candidate.id })}
        class="flex flex-wrap items-center gap-x-10 rounded border-2 border-surface-800 p-2 transition-all hover:scale-[1.01]"
      >
        <div class="aspect-square w-32">
          <img
            class="banner-image"
            src={getCandidateCoverImage(data.election.id, candidate.id, candidate.imageVersion)}
            alt="Candidate Cover"
          />
        </div>
        <div>
          <h4 class="h4">{seperateJoin(candidate.users.map((u) => u.name))}</h4>
        </div>
      </a>
    {:else}
      <p>No Candidates</p>
    {/each}
  </div>
{:else}
  <p>No Roles</p>
{/each}

<hr class="hr mt-2" />

{#if data.election.motionEnabled}
  <div class="flex flex-wrap items-center justify-between gap-x-2">
    <h2 class="h2">Motions</h2>
    {#if data.election.canSignup}
      <form action="?/createMotion" method="post" use:createMotionEnhance>
        <button class="btn preset-tonal-primary" type="submit">Create a Motion</button>
      </form>
    {/if}
  </div>
  <ul>
    {#each data.election.motions as motion}
      <li>
        <a
          href={route("/motion/[motionID]", { motionID: motion.id })}
          class="flex flex-wrap items-center gap-x-10 rounded border-2 border-surface-800 p-2 transition-all hover:scale-[1.01]"
        >
          <h4 class="h4">{motion.name}</h4>
        </a>
      </li>
    {:else}
      <p>No Motions</p>
    {/each}
  </ul>
{/if}
