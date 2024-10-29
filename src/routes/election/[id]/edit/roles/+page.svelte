<script lang="ts">
    import { enhance } from "$app/forms";
    import { superForm } from "sveltekit-superforms";

    let { data } = $props();

    const { enhance: editRoleEnhance } = superForm(
        data.editRoleForm,
        {
            resetForm: false,
            invalidateAll: false,
        },
    );
</script>

<h2>Roles</h2>
<form method="post" action="?/createRole" use:enhance>
    <button type="submit" class="app-btn">Create Role</button>
</form>
{#each data.election.roles as role}
    <form method="post" action="?/editRole" use:editRoleEnhance>
        <input type="hidden" name="id" bind:value={role.id} />
        <input type="text" name="name" bind:value={role.name} />
        <input type="number" name="seatsToFill" min="1" bind:value={role.seatsToFill} />
        <button type="submit" class="app-btn">Save</button>
    </form>
    <form method="post" action="?/deleteRole" use:enhance>
        <input type="hidden" name="id" bind:value={role.id} />
        <button type="submit" class="app-btn">Delete</button>
    </form>
{/each}