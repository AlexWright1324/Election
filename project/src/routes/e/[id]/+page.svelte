<script lang="ts">
	let { data } = $props()
</script>

<h1>{data.election.name}</h1>
{#if data.admin}
	<p>You Are an Admin</p>
    <a href="/e/{data.election.id}/edit">Edit Election</a>
{/if}

<form method="post" action="/e/{data.election.id}/c">
	<h1>Be a Candidate</h1>
	<label for="role">Roles</label>
	<select name="role">
		{#each data.roles as role}
			<option value={role.id}>{role.name}</option>
		{/each}
	</select>
</form>

{data.election.description}