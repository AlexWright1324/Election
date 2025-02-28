<script lang="ts">
  import { page } from "$app/state"
  import { onMount } from "svelte"

  let { data } = $props()

  const signature = page.url.searchParams.get("signature")

  onMount(() => {
    const key = `${data.election.id}-signature`
    if (window.localStorage.getItem(key)) return
    if (!signature) return
    window.localStorage.setItem(key, signature)
  })
</script>

<h1 class="h1">Vote Sucessful</h1>
<p>Your vote has been successfully cast.</p>

<p>Your unique signature is:</p>
<code class="code">{signature}</code>
<p>Save this code to verify your vote at a later date.</p>

<p>You may now close this tab.</p>
