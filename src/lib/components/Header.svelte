<script lang="ts">
	import { SignIn, SignOut } from "@auth/sveltekit/components";

	let {
		uniID,
	}: {
		uniID?: string;
	} = $props();
</script>

<header>
	<div>
		<nav>
			<a href="/">UWCS Elecom</a>
			<a href="/election">Elections</a>
			<a href="/competition">Competitions</a>
		</nav>
		<div>
			{#if uniID}
				<SignOut className="AuthButton">
					<div slot="submitButton">
						<p>
							User: u{uniID}
						</p>
						<p>Logout</p>
					</div>
				</SignOut>
			{:else}
				<SignIn provider="keycloak" className="AuthButton">
					<div slot="submitButton">
						<p>Login</p>
					</div>
				</SignIn>
			{/if}
		</div>
	</div>
</header>

<style>
	header {
		flex-shrink: 0;
		display: flex;
		min-height: 64px;
		width: 100%;
		justify-content: center;
		margin-bottom: 1rem;
		background-color: var(--app-color-1);
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);

		& > div {
			display: flex;
			height: 100%;
			width: 100%;
			justify-content: space-between;
			max-width: var(--page-width);
		}
	}

	nav {
		& a {
			display: inline-flex;
			align-items: center;
			padding: 0 1rem;
			height: 100%;

			&:hover {
				background-color: lch(from var(--app-color-1) calc(l - 5) c h);
			}
		}
	}

	:global(.AuthButton) {
		display: flex;
		height: 100%;
		padding: 0 1rem;
	}
</style>
