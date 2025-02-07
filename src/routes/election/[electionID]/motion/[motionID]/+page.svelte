<script lang="ts">
  import { Markdown } from "carta-md"
  import { carta } from "$lib/client/carta"
  let { data } = $props()
</script>

<h1 class="h1">{data.motion.name}</h1>

<article class="flex flex-wrap gap-2">
  <aside>
    <h3 class="h3">Proposer</h3>
    <p>{data.motion.proposer.name} (u{data.motion.proposer.userID})</p>
    <h3 class="h3">Seconders</h3>
    {#if data.motion.proposer.userID !== data.session?.user.userID && !data.motion.seconders.some((seconder) => seconder.userID === data.session?.user.userID)}
      <form action="?/second" method="post">
        <button type="submit" class="btn preset-filled-primary-500">Second</button>
      </form>
    {/if}
    <ul>
      {#each data.motion.seconders as seconder}
        <li>{seconder.name} (u{seconder.userID})</li>
      {:else}
        <li>No seconders</li>
      {/each}
    </ul>
  </aside>
  <main>
    <Markdown {carta} value={data.motion.description} />
  </main>
</article>
