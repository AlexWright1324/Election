<script lang="ts">
  import BackToElection from "$lib/components/BackToElection.svelte"

  import { seperateJoin } from "$lib/client/separate"
  import { superForm } from "$lib/client/superform"
  import { TextField } from "$lib/components/forms"

  import { signatureSchema } from "./schema"

  import { browser } from "$app/environment"
  import { getContext } from "svelte"
  import { zod } from "sveltekit-superforms/adapters"

  let { data, form } = $props()

  const superform = superForm(getContext("toast"), data.voteForm, {
    resetForm: false,
    validators: zod(signatureSchema),
  })

  superform.form.update(($form) => {
    if (browser) {
      $form.signature = localStorage.getItem(`${data.election.id}-signature`) ?? ""
    }
    return $form
  })

  const { enhance, isTainted, tainted } = superform
</script>

<BackToElection electionID={data.election.id} />

<h1 class="h1">Vote Verification</h1>

<form action="?/verify" method="post" use:enhance>
  <TextField {superform} field="signature" name="Signature" />
  <button type="submit" class="btn preset-filled-primary-500 w-full" disabled={!isTainted($tainted)}> Verify </button>
</form>

{#if form?.ballot}
  <h2 class="h2">Vote</h2>
  {#if form.ballot.candidateVotes.length > 0}
    {@const roleVotes = form.ballot.candidateVotes.reduce<
      {
        id: number
        name: string
        candidates: { id: string; isRON: boolean; users: { name: string }[]; position: number }[]
      }[]
    >((acc, vote) => {
      const role = acc.find((role) => role.id === vote.candidate.role.id)
      const candidate = {
        ...vote.candidate,
        position: vote.position,
      }
      if (role) {
        role.candidates.push(candidate)
      } else {
        acc.push({
          id: vote.candidate.role.id,
          name: vote.candidate.role.name,
          candidates: [candidate],
        })
      }
      return acc
    }, [])}
    <h3 class="h3">Roles</h3>
    {#each roleVotes as roleVote}
      <div>
        <h4 class="h4">{roleVote.name}</h4>
        <ol class="ml-6 list-decimal">
          {#each roleVote.candidates.sort((a, b) => a.position - b.position) as candidate}
            <li>
              {#if candidate.isRON}
                <span>Re-Open Nominations</span>
              {:else}
                <span>{seperateJoin(candidate.users.map((u) => u.name))}</span>
              {/if}
            </li>
          {/each}
        </ol>
      </div>
    {/each}
  {/if}
  {#if form.ballot.motionVotes.length > 0}
    <h3 class="h3">Motions</h3>
    {#each form.ballot.motionVotes as motionVote}
      <div>
        <span class="font-bold">{motionVote.motion.name}:</span>
        <span>{motionVote.vote}</span>
      </div>
    {/each}
  {/if}
{/if}
