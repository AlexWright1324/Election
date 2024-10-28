<script lang="ts">
	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';

	import '$lib/stylesheets/styles.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let {
		data,
		children
	}: {
		data: PageData;
		children: Snippet;
	} = $props();
</script>

<Header uniID={data.session?.user?.uniID} />
<main>
	{@render children()}
</main>
<Footer />

<style>
	main {
		flex: 1;
		width: 100%;
		max-width: var(--page-width);
		padding: 0 1rem;
	}
</style>