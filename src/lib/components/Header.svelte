<script lang="ts">
  import { SignIn, SignOut } from "@auth/sveltekit/components"

  let {
    userID,
  }: {
    userID?: string
  } = $props()
</script>

<header>
  <div>
    <nav>
      <a href="/">UWCS Elections</a>
      <a href="/election">Elections</a>
    </nav>
    <div>
      {#if userID}
        u{userID}
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
    @apply w-full border-b-[1px] border-surface-500/20 p-4 py-3 bg-surface-950-50;
    > div {
      @apply mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4;
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
