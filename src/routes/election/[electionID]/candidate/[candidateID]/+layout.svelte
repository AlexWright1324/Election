<script lang="ts">
    import { page } from '$app/state';
    let { data, children } = $props();
</script>

{#if data.candidateAdmin}
{@const url = `/election/${data.election.id}/candidate/${data.candidate.id}`}
<nav class="app-btn-bar">
    <a href="/election/{data.election.id}">Back</a>
    <a href={url} aria-current={page.url.pathname === url ? 'page' : undefined}>Preview</a>
    <a href="{url}/edit" aria-current={page.url.pathname === url + '/edit' ? 'page' : undefined}>Edit</a>
</nav>
{/if}

{@render children()}