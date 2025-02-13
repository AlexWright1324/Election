<script lang="ts">
  import { TextField } from "$lib/components/forms/index"

  import { enhance } from "$app/forms"
  import { superForm } from "sveltekit-superforms/client"

  let { data } = $props()
  const inviteSuperform = superForm(data.inviteForm)
  const { enhance: inviteEnhance } = inviteSuperform
</script>

<form class="flex items-end gap-2" action="?/invite" method="post" use:inviteEnhance>
  <TextField superform={inviteSuperform} field="userID" name="User ID" />
  <button class="btn preset-filled-primary-500" type="submit">Invite</button>
</form>

<h2 class="h2">Invites</h2>

<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>User ID</th>
      <th class="text-right"></th>
    </tr>
  </thead>
  <tbody>
    {#each data.candidate.userInvites as invite}
      <tr>
        <td>{invite.name}</td>
        <td>{invite.userID}</td>
        <td class="text-right">
          <form action="?/uninvite" method="post" use:enhance>
            <input type="hidden" name="userID" bind:value={invite.userID} />
            <button class="btn preset-filled-tertiary-500" type="submit">Uninvite</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2">Total</td>
      <td class="text-right">{data.candidate.userInvites.length} Invites</td>
    </tr>
  </tfoot>
</table>
