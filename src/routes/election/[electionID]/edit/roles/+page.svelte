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

<form method="post" action="?/editRoles" use:enhance>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="btn preset-tonal-primary mb-2" onclick={addRole}>Add Role</button>
    <button type="submit" class="btn preset-filled-primary-500" disabled={!isTainted($tainted)}>Save</button>
  </div>
  <ul>
    {#each $form.roles as role, index}
      <li class="flex gap-2 justify-center items-end">
        <input type="hidden" name="id" bind:value={role.id} />
        <label class="label">
          <span class="label-text">Role Name</span>
          <input class="input" type="text" name="name" bind:value={role.name} />
        </label>
        <label class="label">
          <span class="label-text">Seats to Fill</span>
          <input class="input" type="number" name="seatsToFill" min="1" bind:value={role.seatsToFill} />
        </label>
        <button type="button" class="btn preset-filled-error-500" onclick={() => removeRole(index)}>Remove</button>
      </li>
    {/each}
  </ul>
</form>
