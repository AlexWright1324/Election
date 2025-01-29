<script lang="ts">
  import { superForm } from "sveltekit-superforms/client"

  let { data } = $props()

  const { form, errors, enhance } = superForm(data.inviteForm)
  const { enhance: uninviteEnhance } = superForm(data.uninviteForm)
</script>

<form class="flex items-end gap-2" action="?/invite" method="post" use:enhance>
  <label class="label">
    <div class="flex flex-wrap gap-2">
      <span class="label-text">University ID</span>
      {#if $errors.userID}
        <span class="label-text text-error-500">
          ⚠️ {$errors.userID}
        </span>
      {/if}
    </div>

    <input class="input" type="text" name="userID" placeholder="1234567" bind:value={$form.userID} />
    <span></span>
  </label>
  <button class="btn preset-filled-primary-500" type="submit">Invite</button>
</form>

{$errors._errors}

<p>Exclude the 'u' prefixing</p>

<h2 class="h2">Invites</h2>

<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>University ID</th>
      <th class="text-right"></th>
    </tr>
  </thead>
  <tbody>
    {#each data.currentInvites as invite}
      <tr>
        <td>{invite.user.name}</td>
        <td>{invite.user.userID}</td>
        <td class="text-right">
          <form action="?/uninvite" method="post" use:uninviteEnhance>
            <input type="hidden" name="id" bind:value={invite.id} />
            <button class="btn preset-filled-tertiary-500" type="submit">Uninvite</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2">Total</td>
      <td class="text-right">{data.currentInvites.length} Invites</td>
    </tr>
  </tfoot>
</table>
