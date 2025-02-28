<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { seperateJoin } from "$lib/client/separate"
  import { getCandidateCoverImage } from "$lib/client/store"
  import { superForm } from "$lib/client/superform"

  import { Markdown } from "carta-md"
  import { getContext } from "svelte"

  let { data } = $props()

  const { enhance: acceptInviteEnhance } = superForm(getContext("toast"), data.acceptInviteForm)
</script>

{#if data.invited}
  <p>You have been invited to join this candidancy as a member.</p>
  <form action="?/acceptInvite" method="post" use:acceptInviteEnhance>
    <button class="btn preset-filled-primary-500" type="submit">Join</button>
  </form>
{/if}

<article class="flex flex-wrap gap-x-4">
  <aside class="mb-2 max-w-xs">
    <div class="banner-image-container">
      <img
        class="banner-image"
        src={getCandidateCoverImage(data.candidate.role.election.id, data.candidate.id)}
        alt="Candidate Banner"
      />
    </div>
    <h3 class="h3">Members</h3>
    <p>
      {seperateJoin(data.candidate.users.map((user) => user.name))}
    </p>
    <h3 class="h3">Running for {data.candidate.role.name}</h3>
  </aside>
  <Markdown {carta} value={data.candidate.description} />
</article>

<hr class="hr" />
