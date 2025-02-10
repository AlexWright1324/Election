<script lang="ts">
  import DragOrderInput from "$lib/components/input/DragOrderInput.svelte"
  import SuperDebug, { superForm } from "sveltekit-superforms"
  let { data } = $props()

  const { form, enhance } = superForm(data.voteForm, {
    dataType: "json",
  })

  $form.roles = data.election.roles.map((r) => ({ id: r.id, candidates: [] }))
  // @ts-ignore
  $form.motions = data.election.motions.map((m) => ({ id: m.id }))
</script>

<h1 class="h1">Vote</h1>

<SuperDebug data={$form} />

<form action="?/vote" method="post" use:enhance>
  {#each data.election.roles as role, index}
    <h2 class="h2">{role.name}</h2>
    <DragOrderInput candidates={role.candidates} bind:value={$form.roles[index].candidates} />
  {/each}

  {#each data.election.motions as motion, index}
    <h2 class="h2">{motion.name}</h2>
    {#each [["For", true], ["Against", false], ["Abstain", null]] as [label, value]}
      <label class="flex items-center gap-2">
        <input class="radio" type="radio" name="motion-{index}" {value} bind:group={$form.motions[index].vote} />
        <p>{label}</p>
      </label>
    {/each}
  {/each}

  <button class="btn preset-filled-primary-500">Vote</button>
</form>
