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
  a {
    @apply block max-w-md overflow-hidden;
    @apply card-hover;
    @apply preset-filled-surface-900-100 border-[1px] border-surface-800-200 divide-y divide-surface-800-200;
  }
  header {
    > img {
      @apply w-full aspect-[16/9] object-cover;
    }
  }
  article {
    @apply p-4;
  }
  footer {
    @apply flex items-center justify-between p-4;
  }
</style>
