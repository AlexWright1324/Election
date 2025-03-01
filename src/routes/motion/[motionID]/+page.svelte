<script lang="ts">
  import { date } from "$lib/client/time.svelte"
  import DisableButton from "$lib/components/DisableButton.svelte"

  import { carta } from "$lib/client/carta"
  import { UserCanRequestSecondMotion } from "$lib/client/checks"

  import { Markdown } from "carta-md"

  let { data } = $props()

  const canRequestSecond = UserCanRequestSecondMotion(data.motion, data.session?.user, date.now)
</script>

<h1 class="h1">{data.motion.name}</h1>

<article class="flex flex-wrap gap-2">
  <aside>
    <h3 class="h3">Proposer</h3>
    <p>{data.motion.proposer.name} (u{data.motion.proposer.userID})</p>
    <h3 class="h3">Seconders</h3>
    <form action="?/second" method="post">
      <DisableButton
        class="w-full"
        type="submit"
        text="Second"
        disabled={!canRequestSecond.allow}
        disabledText={canRequestSecond.error}
      />
    </form>
    <ul>
      {#each data.motion.seconders as seconder}
        <li>{seconder.name} (u{seconder.userID})</li>
      {:else}
        <div class="preset-outlined-warning-500 rounded-xl p-2 m-2">
          <span>⚠️ Motion cannot be voted on without a seconder</span>
        </div>
      {/each}
    </ul>
  </aside>
  <main>
    <Markdown {carta} value={data.motion.description} />
  </main>
</article>
