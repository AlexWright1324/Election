<script lang="ts">
    import { page } from '$app/stores';
    let { data, children } = $props();
</script>

<nav class="app-btn-bar">
    <a href="/election/{data.election.id}" class="red">Back</a>
    <a href="/election/{data.election.id}/edit" class:app-btn-bar-current={$page.url.pathname.endsWith('/edit')}>Edit</a>
    <a href="/election/{data.election.id}/edit/roles" class:app-btn-bar-current={$page.url.pathname.endsWith('/edit/roles')}>Roles</a>
    <form method="post" action="?/delete" style="margin-left: auto;">
        <button type="submit" class="red">Delete Election</button>
    </form>
</nav>

{@render children()}

<style>
    .red {
        background-color: rgb(100, 20, 20);
    }
</style>