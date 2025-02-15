<script lang="ts">
  import { page } from "$app/state"
</script>

<h1 class="h1">Error {page.status}</h1>

{#if page.error}
  <h2 class="h2">{page.error.message}</h2>
{/if}
