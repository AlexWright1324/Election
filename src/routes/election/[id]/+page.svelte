<script lang="ts">
import { Markdown } from "carta-md"
import { carta } from "$lib/client/carta"
let { data } = $props()
</script>

<h1>{data.election.name}</h1>
{#if data.admin}
	<p>You Are an Admin</p>
	<a href="/election/{data.election.id}/edit">Edit Election</a>
{/if}

<form method="post">
	<h1>Be a Candidate</h1>
	<label for="role">Roles</label>
	<select name="role">
		{#each data.election.roles as role}
			<option value={role.id}>{role.name}</option>
		{/each}
	</select>
</form>
<Markdown {carta} value={data.election.description}/>