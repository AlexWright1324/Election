<script lang="ts">
  import Discard, { taintedMessage } from "$lib/components/modals/Discard.svelte"

  import { superForm } from "$lib/client/superform"
  import { NumberField, TextField } from "$lib/components/forms"

  import { getContext } from "svelte"

  let { data } = $props()

  const superform = superForm(getContext("toast"), data.editRolesForm, {
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

<Discard />

<!-- Disabled while ongoing, warning if deletion causes candidates to dissapear -->

<form class="table-wrap" method="post" action="?/editRoles" use:enhance>
  <table class="table">
    <thead>
      <tr>
        <th>Role Name</th>
        <th>Seats to Fill</th>
        <th class="!text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each $form.roles as role, index}
        <tr>
          <td><TextField {superform} field="roles[{index}].name" /></td>
          <td><NumberField {superform} field="roles[{index}].seatsToFill" /></td>
          <td class="!text-right">
            <input type="hidden" name="id" bind:value={role.id} />
            <button type="button" class="btn preset-filled-error-500 w-full" onclick={() => removeRole(index)}>
              Remove
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">
          <button type="button" class="btn preset-tonal-primary" onclick={addRole}>Add Role</button>
        </td>
        <td>
          <button type="submit" class=" btn preset-filled-primary-500 w-full" disabled={!isTainted($tainted)}
            >Save</button
          >
        </td>
      </tr>
    </tfoot>
  </table>
</form>
