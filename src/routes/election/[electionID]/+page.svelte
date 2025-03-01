<script lang="ts">
  import { date } from "$lib/client/time.svelte"
  import DisableAnchor from "$lib/components/DisableAnchor.svelte"
  import DisableButton from "$lib/components/DisableButton.svelte"

  import Results from "./results/Results.svelte"

  import { route } from "$lib/ROUTES"
  import { carta } from "$lib/client/carta"
  import { UserCanCreateCandidate, UserCanCreateMotion, UserCanVote } from "$lib/client/checks"
  import { seperateJoin } from "$lib/client/separate"
  import { getCandidateCoverImage, getElectionCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"

  import ElectionInfo from "../ElectionInfo.svelte"
  import { Markdown } from "carta-md"
  import { getContext } from "svelte"

  const { data } = $props()

  const { enhance: candidateSignupEnhance } = superForm(getContext("toast"), data.candidateSignupForm)
  const { enhance: createMotionEnhance } = superForm(getContext("toast"), data.createMotionForm)

  const canVote = UserCanVote(data.election, data.session?.user, date.now)
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
      class="w-full"
      href={route("/election/[electionID]/vote", { electionID: data.election.id })}
      text="Vote"
      disabled={!canVote.allow}
      disabledText={canVote.error}
    />
    {#if data.election.hasVoted}
      <a
        class="btn preset-filled-primary-500 w-full"
        href={route("/election/[electionID]/verify", { electionID: data.election.id })}
      >
        Verify Vote
      </a>
    {/if}
  </div>
  <Markdown {carta} value={data.election.description} />
</article>

{#if data.election.resultsPosted}
  <hr class="hr mt-2" />

  <h2 class="h2">Results</h2>
  <Results motions={data.election.motions} roles={data.election.roles} />
{/if}

<hr class="hr mt-2" />

<h2 class="h2">Roles</h2>
{#each data.election.roles as role}
  {@const canCreate = UserCanCreateCandidate(data.election, role, data.session?.user, date.now)}
  <div class="flex flex-wrap items-center justify-between gap-x-2">
    <h3 class="h3">{role.name}</h3>
    <form action="?/candidateSignup" method="post" use:candidateSignupEnhance>
      <input type="hidden" name="roleID" value={role.id} />
      <DisableButton text="Become a Candidate" disabledText={canCreate.error} disabled={!canCreate.allow} />
    </form>
  </div>
  {#if role.seatsToFill > 1}
    <p class="text-primary-500">{role.seatsToFill} Seats to fill</p>
  {/if}
  <div class="divide-surface-500 divide-y-2">
    {#each role.candidates as candidate}
      <a
        href={route("/candidate/[candidateID]", { candidateID: candidate.id })}
        class="border-surface-800 mt-2 mb-2 flex flex-wrap items-center gap-x-10 rounded border-2 p-2 transition-all hover:scale-[1.01]"
      >
        <div class="banner-image-container max-w-32">
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
  {@const canCreate = UserCanCreateMotion(data.election, data.session?.user, date.now)}
  <div class="mb-2 flex flex-wrap items-center justify-between gap-x-2">
    <h2 class="h2">Motions</h2>
    <form action="?/createMotion" method="post" use:createMotionEnhance>
      <DisableButton text="Propose a Motion" disabledText={canCreate.error} disabled={!canCreate.allow} />
    </form>
  </div>
  <div class="flex flex-col gap-2">
    {#each data.election.motions as motion}
      <a
        href={route("/motion/[motionID]", { motionID: motion.id })}
        class="border-surface-800 flex flex-wrap items-center gap-x-10 rounded border-2 p-2 transition-all hover:scale-[1.01]"
      >
        <h4 class="h4">{motion.name}</h4>
        <div>
          <span class="font-bold">Proposed by:</span>
          <span>{motion.proposer.name}</span>
        </div>
        <div>
          {#if motion.seconders.length > 0}
            <span class="font-bold">Seconded by:</span>
            <span>{seperateJoin(motion.seconders.map((s) => s.name))}</span>
          {:else}
            <span class="font-bold">No Seconders</span>
          {/if}
        </div>
      </a>
    {:else}
      <p>No Motions</p>
    {/each}
  </div>
{/if}
