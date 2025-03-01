<script lang="ts">
  import BackToElection from "$lib/components/BackToElection.svelte"

  import DragOrderInput from "./DragOrderInput.svelte"
  import Radio from "./Radio.svelte"

  import { seperateJoin } from "$lib/client/separate"
  import { superForm } from "$lib/client/superform"

  import { motionVote, serverVoteSchema } from "./schema"

  import { getContext, onMount } from "svelte"
  import { type SuperValidated } from "sveltekit-superforms"
  import { zod } from "sveltekit-superforms/adapters"
  import type { z } from "zod"

  let { data } = $props()
  const superform = superForm(
    getContext("toast"),
    data.voteForm as SuperValidated<z.infer<typeof serverVoteSchema>, any, z.infer<typeof serverVoteSchema>>,
    {
      resetForm: false,
      dataType: "json",
      validators: zod(serverVoteSchema),
    },
  )
  const { enhance, isTainted, tainted, validateForm, allErrors } = superform

  // Ensure errors are displayed on mount.
  onMount(async () => {
    await validateForm({ update: true })
  })
</script>

<BackToElection electionID={data.election.id} />

<h1 class="h1">Vote</h1>

<form action="?/vote" method="post" use:enhance>
  <h2 class="h2">Roles</h2>
  {#each data.election.roles as role, index (role.id)}
    <DragOrderInput
      {superform}
      name={role.name}
      field="roles[{index}].candidates"
      candidates={role.candidates.map((c) => ({
        id: c.id,
        name: seperateJoin(c.users.map((u) => u.name)),
        isRON: c.isRON,
      }))}
    />
  {:else}
    <p>No roles to vote for</p>
  {/each}

  <h2 class="h2">Motions</h2>
  {#each data.election.motions as motion, index}
    <Radio {superform} field="motions[{index}].vote" name={motion.name} options={motionVote} />
  {:else}
    <p>No motions to vote for</p>
  {/each}

  <button class="btn preset-filled-primary-500 mt-2 w-full" disabled={!isTainted($tainted) || $allErrors.length !== 0}>
    Submit Vote
  </button>
</form>
