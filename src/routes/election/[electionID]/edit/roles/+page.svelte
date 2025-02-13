<script lang="ts">
  import UnsavedModal, { taintedMessage } from "$lib/components/modals/Unsaved.svelte"

  import { NumberField, TextField } from "$lib/components/forms/index"

  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  const superform = superForm(data.editRolesForm, {
    dataType: "json",
    resetForm: false,
    taintedMessage,
    invalidateAll: true,
  })

  const { form, enhance, isTainted, tainted } = superform

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

  const removeRole = (roleID: number) => {
    $form.roles = $form.roles.filter((_, i) => i !== roleID)
  }
</script>

<UnsavedModal />

<form method="post" action="?/editRoles" use:enhance>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="btn preset-tonal-primary mb-2" onclick={addRole}>Add Role</button>
    <button type="submit" class="btn preset-filled-primary-500" disabled={!isTainted($tainted)}>Save</button>
  </div>
  <ul>
    {#each $form.roles as role, index}
      <li class="flex gap-2 justify-center items-end">
        <input type="hidden" name="id" bind:value={role.id} />
        <TextField {superform} field="roles[{index}].name" name="Role Name" />
        <NumberField {superform} field="roles[{index}].seatsToFill" name="Seats to Fill" />
        <button type="button" class="btn preset-filled-error-500" onclick={() => removeRole(index)}>Remove</button>
      </li>
    {/each}
  </ul>
</form>
