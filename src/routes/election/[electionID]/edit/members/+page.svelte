<script lang="ts">
  import { superForm } from "$lib/client/superform"
  import { TextField } from "$lib/components/forms"

  import { updateApiKeySchema, editMemberSchema } from "./schema"

  import { getContext } from "svelte"
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

  const editMemberSuperform = superForm(getContext("toast"), data.editMemberForm, {
    resetForm: false,
  })

  const {
    enhance: editMemberFormEnhance,
    isTainted: editMemberIsTainted,
    tainted: editMemberTainted,
  } = editMemberSuperform
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

<h1 class="h1">Members List</h1>

<div class="table-wrap block max-h-96">
  <table class="table h-full">
    <thead class="bg-surface-contrast-100 sticky top-0">
      <tr>
        <th>Member ID</th>
        <th>Member Name</th>
        <th class="!text-right">Actions</th>
      </tr>
    </thead>
    <tbody class="overflow-y-auto">
      {#each data.members as member}
        <tr>
          <td>{member.userID}</td>
          <td>{member.name}</td>
          <td class="text-right">
            <form action="?/removeMember" method="post" use:editMemberFormEnhance>
              <input type="hidden" name="userID" value={member.userID} />
              <button class="btn preset-filled-error-500" type="submit">Remove</button>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot class="sticky bottom-0">
      <tr>
        <td class="!pt-0 !pb-0" colspan="2">
          <form id="addMember" class="flex items-center" action="?/addMember" method="post" use:editMemberFormEnhance>
            <TextField superform={editMemberSuperform} field="userID" />
          </form>
        </td>
        <td class="!text-right">
          <button class="btn preset-filled-primary-500" type="submit" form="addMember">Add Member</button>
        </td>
      </tr>
      <tr>
        <td colspan="2">Total</td>
        <td class="text-right">{data.members.length} Members</td>
      </tr>
    </tfoot>
  </table>
</div>
