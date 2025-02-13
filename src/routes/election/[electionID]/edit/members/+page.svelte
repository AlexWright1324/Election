<script lang="ts">
  import { superForm } from "$lib/client/superform"
  import { TextField } from "$lib/components/forms"

  import type { ActionData } from "./$types"
  import "./schema"
  import { updateApiKeySchema, updateMembersSchema } from "./schema"
  import { getContext } from "svelte"
  import { type FormResult } from "sveltekit-superforms"
  import { zodClient } from "sveltekit-superforms/adapters"

  let { data } = $props()

  const updateApiKeySuperform = superForm(getContext("toast"), data.updateApiKeyForm, {
    resetForm: false,
    validators: zodClient(updateApiKeySchema),
  })

  const {
    enhance: updateApiKeyFormEnhance,
    isTainted: updateApiKeyIsTainted,
    tainted: updateApiKeyTainted,
  } = updateApiKeySuperform

  const {
    form: updateMembersForm,
    enhance: updateMembersEnhance,
    isTainted: updateMembersIsTainted,
    tainted: updateMembersTainted,
  } = superForm(getContext("toast"), data.updateMembersForm, {
    dataType: "json",
    resetForm: false,
    validators: zodClient(updateMembersSchema),
  })

  const { enhance: populateMembersEnhance } = superForm(getContext("toast"), data.populateMembersForm, {
    onUpdate({ form, result, cancel }) {
      const action = result.data as FormResult<ActionData>
      if (!form.valid || !Array.isArray(action.APIMembers)) return

      // Merge the new members with the existing members on userID
      const newMembers = action.APIMembers
      newMembers.forEach((newMember) => {
        const existingMember = $updateMembersForm.members.find((member) => member.userID === newMember.userID)
        if (existingMember) return

        updateMembersForm.update(($form) => {
          $form.members.push(newMember)
          return $form
        })
      })
      cancel()
    },
  })

  const addMember = () => {
    const memberID = (document.getElementById("addMemberID")! as HTMLInputElement).value

    const existingMember = $updateMembersForm.members.find((member) => member.userID === memberID)
    const errorElement = document.getElementById("addMemberIDError")!
    if (!existingMember) {
      updateMembersForm.update(($form) => {
        $form.members.push({ userID: memberID, name: "" })
        return $form
      })
      errorElement.textContent = ""
      return
    }

    errorElement.textContent = "⚠️ Member already exists"
  }
</script>

<form class="flex flex-col gap-2" action="?/updateApiKey" method="post" use:updateApiKeyFormEnhance>
  <TextField superform={updateApiKeySuperform} field="apiKey" name="API Key" />
  <button class="btn preset-filled-primary-500" type="submit" disabled={!updateApiKeyIsTainted($updateApiKeyTainted)}>
    Update API Key
  </button>
  <button
    class="btn preset-filled-primary-500"
    type="submit"
    form="populateMembers"
    disabled={updateApiKeyIsTainted($updateApiKeyTainted)}
  >
    Populate Members List
  </button>
</form>

<form
  class="flex flex-col mt-2"
  action="?/populateMembers"
  method="post"
  id="populateMembers"
  use:populateMembersEnhance
></form>

<h1 class="h1">Members List</h1>

<form class="flex flex-col gap-2" action="?/updateMembers" method="post" use:updateMembersEnhance>
  <button class="btn preset-filled-primary-500" type="submit" disabled={!updateMembersIsTainted($updateMembersTainted)}>
    Update Members
  </button>
  <div class="table-wrap block max-h-96">
    <table class="table h-full">
      <thead class="sticky top-0 bg-surface-contrast-100">
        <tr>
          <th>Member ID</th>
          <th>Member Name</th>
          <th class="!text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="overflow-y-auto">
        {#each $updateMembersForm.members as _, index}
          <tr>
            <td>{$updateMembersForm.members[index].userID}</td>
            <td>{$updateMembersForm.members[index].name}</td>
            <td class="text-right">
              <button
                class="btn preset-filled-error-500"
                type="button"
                onclick={() =>
                  updateMembersForm.update(($form) => {
                    $form.members.splice(index, 1)
                    return $form
                  })}
              >
                Remove
              </button>
              <input type="hidden" name="userID" bind:value={$updateMembersForm.members[index].userID} />
              <input type="hidden" name="name" bind:value={$updateMembersForm.members[index].name} />
            </td>
          </tr>
        {/each}
      </tbody>
      <tfoot class="sticky bottom-0">
        <tr>
          <td colspan="2">Total</td>
          <td class="text-right">{$updateMembersForm.members.length} Members</td>
        </tr>
      </tfoot>
    </table>
  </div>
</form>

<div class="flex items-end gap-2">
  <label class="label">
    <div class="flex gap-2 label-text">
      <span>Member ID</span>
      <span class="text-error-500" id="addMemberIDError"></span>
    </div>
    <input class="input" type="text" id="addMemberID" />
  </label>
  <button class="btn preset-filled-primary-500" type="button" onclick={addMember}>Add Member</button>
</div>
