<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';

	let {
		uniID
	}: {
		uniID?: string;
	} = $props();
</script>

<header>
	<nav>
		<a href="/">UWCS Elecom</a>
		<a href="/e">Elections</a>
		<a href="/c">Competitions</a>
	</nav>
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
</header>

<style>
	header {
		background-color: grey;
		display: flex;
		justify-content: space-between;
		align-items: center;
		& nav {
			height: 100%;
			display: flex;
		}
	}
</style>