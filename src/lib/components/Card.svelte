<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        href,
        image,
        children,
    }: {
        href?: string;
        image?: string;
        children?: Snippet;
    } = $props();
</script>

<a {href} class="card" class:link={href}>
    <img src={image} alt="Card Cover" />
    <div>
        {#if children}
        {@render children()}
        {/if}
    </div>
</a>

<style>
    .card {
        max-width: 300px;
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        & > img {
            width: 100%;
        }

        & > div {
            width: 100%;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            padding: 0.5rem;
        }
    }

    .link {
        max-width: 250px;
        height: 450px;
        border-radius: 20px;
        border: 2px solid var(--app-color-3);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        transition: transform 0.1s ease-in-out;
        
        > div {
            border-top: 2px solid var(--app-color-3);
        }

        &:hover {
            transform: scale(1.01);
        }
    }
</style>
