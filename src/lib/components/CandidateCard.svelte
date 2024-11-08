<script lang="ts">
    import type { Candidate } from "@prisma/client";
    import Card from "$lib/components/Card.svelte";

    let {
        candidate,
        href,
        image,
    }: {
        candidate: Candidate;
        href?: string;
        image?: string;
    } = $props();
</script>

<Card {href} {image}>
    <h3>{candidate.name}</h3>
</Card>
