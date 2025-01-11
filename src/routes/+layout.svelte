<script lang="ts">
	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';
	
	import "$lib/stylesheets/app.css";
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

<style lang="postcss">
	main {
		@apply max-w-screen-2xl mx-auto w-full p-4
	}
</style>