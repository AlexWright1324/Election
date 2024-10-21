<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';

	let {
		uniID
	}: {
		uniID?: string;
	} = $props();
</script>

<div>
	<div>
		<a href="/">UWCS Elecom</a>
		<a href="/e">Elections</a>
		<a href="/c">Competitions</a>
	</div>
	<div>
		{#if uniID}
			<div>
				<p>
					User: u{uniID}
				</p>
				<SignOut>
					<span slot="submitButton">Logout</span>
				</SignOut>
			</div>
		{:else}
			<div>
				<SignIn provider="keycloak">
					<span slot="submitButton">Login</span>
				</SignIn>
			</div>
		{/if}
	</div>
</div>
