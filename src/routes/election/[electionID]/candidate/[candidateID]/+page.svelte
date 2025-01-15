<script lang="ts">
  import { Markdown } from "carta-md"

  import Card from "$lib/components/Card.svelte"
  import { seperateJoin } from "$lib/client/separate"
  import { getCandidateCoverImage } from "$lib/client/store"
  import { carta } from "$lib/client/carta"

  let { data } = $props()
</script>

<h1 class="h1">{data.candidate.name}</h1>

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
