<script lang="ts">
  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  const { form, enhance, isTainted, tainted } = superForm(data.editRolesForm, {
    dataType: "json",
    resetForm: false,
    taintedMessage: async () => {
        return confirm("You have unsaved changes. Are you sure you want to leave?")
    },
  })

  const addRole = () => {
    $form.roles = [
      ...$form.roles,
      {
        id: null,
        name: "New Role",
        seatsToFill: 1,
      },
    ]
  }

  const removeRole = (index: number) => {
    $form.roles = $form.roles.filter((_, i) => i !== index)
  }
</script>

<h2>Roles</h2>
<form method="post" action="?/editRoles" use:enhance>
  <ul>
    {#each $form.roles as role, index}
      <li>
        <input type="hidden" name="id" bind:value={role.id} />
        <input type="text" name="name" bind:value={role.name} />
        <input type="number" name="seatsToFill" min="1" bind:value={role.seatsToFill} />
        <button type="button" class="app-btn" onclick={() => removeRole(index)}>Remove</button>
      </li>
    {/each}
  </ul>
  <button type="button" class="app-btn" onclick={addRole}>Add Role</button>
  {#if isTainted($tainted)}
    <button type="submit" class="app-btn">Save</button>
  {/if}
</form>
