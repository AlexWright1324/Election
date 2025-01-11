<script lang="ts">
  import { SignIn, SignOut } from "@auth/sveltekit/components"

  let {
    uniID,
  }: {
    uniID?: string
  } = $props()
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
        u{uniID}
        <SignOut className="btn preset-tonal-primary">
          <div slot="submitButton">Logout</div>
        </SignOut>
      {:else}
        <SignIn provider="keycloak" className="btn preset-filled">
          <div slot="submitButton">Login</div>
        </SignIn>
      {/if}
    </div>
  </div>
</header>

<style lang="postcss">
  header {
    @apply w-full p-4 py-3 bg-surface-950-50 border-surface-500/20 border-b-[1px];
    > div {
      @apply max-w-screen-2xl mx-auto flex flex-wrap justify-between gap-4 items-center;
      > nav,
      > div {
        @apply flex items-center gap-3;
      }
    }
    nav {
      @apply opacity-80;
      > a {
        @apply hover:underline;
      }
    }
  }
</style>
