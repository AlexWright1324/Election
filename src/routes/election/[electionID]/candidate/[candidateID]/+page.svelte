<script lang="ts">
  import { Markdown } from "carta-md"

  import { seperateJoin } from "$lib/client/separate"
  import { getCandidateCoverImage } from "$lib/client/store"
  import { carta } from "$lib/client/carta"
  import { enhance } from "$app/forms"

  let { data, form } = $props()
</script>

{#if data.invited}
  <p>You have been invited to join this candidancy as a member.</p>
  <form action="?/acceptInvite" method="post" use:enhance>
    <button class="btn preset-filled-primary-500" type="submit">Join</button>
  </form>
{/if}

<article class="flex flex-wrap gap-x-4">
  <aside class="max-w-xs mb-2">
    <img src={getCandidateCoverImage(data.election.id, data.candidate.id)} alt="Candidate Banner" />
    <h3 class="h3">Members</h3>
    <p>
      {seperateJoin(data.candidate.users.map((user) => user.name))}
    </p>
    <h3 class="h3">Running for</h3>
    <p>
      {seperateJoin(data.candidate.roles.map((role) => role.name))}
    </p>
  </aside>
  <Markdown {carta} value={data.candidate.description} />
</article>

<hr class="hr" />
