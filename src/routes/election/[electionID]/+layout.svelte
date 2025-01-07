<script lang="ts">
  import { page } from "$app/state"
  let { data, children } = $props()
</script>

{#if data.admin}
  {@const url = `/election/${data.election.id}`}
  <nav class="app-btn-bar">
    <a href={url} aria-current={page.url.pathname === url ? "page" : undefined}> Preview </a>
    <a href="{url}/edit" aria-current={page.url.pathname === url + "/edit" ? "page" : undefined}>Edit</a>
    <a href="{url}/edit/roles" aria-current={page.url.pathname === url + "/edit/roles" ? "page" : undefined}>Roles</a>
  </nav>
{/if}

{@render children()}
