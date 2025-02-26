<script lang="ts">
  import { page } from "$app/state"

  let { data } = $props()
</script>

<h1 class="h1">Vote Sucessful</h1>
<p>Your vote has been successfully cast.</p>

<p>Your unique signature is:</p>
<code class="code">{page.url.searchParams.get("signature")}</code>
<p>Save this code to verify your vote at a later date.</p>

<p>You may now close this tab.</p>
