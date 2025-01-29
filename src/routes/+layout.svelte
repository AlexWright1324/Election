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

<Header userID={data.session?.user?.userID} />
<main class="max-w-screen-2xl w-full min-w-0 mx-auto p-4">
	{@render children()}
</main>
<Footer />