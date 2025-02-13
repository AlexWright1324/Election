<script lang="ts">
  import { superForm } from "sveltekit-superforms"

  let { data } = $props()

  const { enhance } = superForm(data.requestForm, {
    resetForm: false,
  })
</script>

<h1 class="h1">Seconder Requests</h1>

<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>UserID</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each data.motion.seconderRequests as request}
        <tr>
          <td>{request.name}</td>
          <td>{request.userID}</td>
          <td>
            <form method="post" use:enhance>
              <input type="hidden" name="userID" bind:value={request.userID} />
              <button formaction="?/accept" type="submit" class="btn preset-filled-primary-500">Accept</button>
              <button formaction="?/reject" type="submit" class="btn preset-filled-error-500">Reject</button>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">Total</td>
        <td class="text-right">{data.motion.seconderRequests.length} Requests</td>
      </tr>
    </tfoot>
  </table>
</div>
