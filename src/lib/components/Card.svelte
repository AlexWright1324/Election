<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    href,
    image,
    children,
    footer,
  }: {
    href?: string
    image?: string
    children?: Snippet
    footer?: Snippet
  } = $props()
</script>

<a {href} class="card">
  <header>
    <img src={image} alt="Card Cover Banner" />
  </header>
  <article>
    {#if children}
      {@render children()}
    {/if}
  </article>
  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</a>

<style lang="postcss">
  @reference "$lib/stylesheets/app.css";

  a {
    @apply block max-w-md overflow-hidden;
    @apply card-hover;
    @apply border-surface-800-200 divide-surface-800-200 preset-filled-surface-900-100 divide-y border-[1px];
  }
  header {
    > img {
      @apply aspect-[16/9] w-full object-cover;
    }
  }
  article {
    @apply p-4;
  }
  footer {
    @apply flex items-center justify-between p-4;
  }
</style>
