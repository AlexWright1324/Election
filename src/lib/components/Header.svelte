<script lang="ts">
  import { route } from "$lib/ROUTES"

  import { SignIn, SignOut } from "@auth/sveltekit/components"

  let {
    userID,
  }: {
    userID?: string
  } = $props()
</script>

<header class="w-full border-b-[1px] border-surface-500/20 p-4 py-3 preset-filled-surface-100-900">
  <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4">
    <nav class="flex items-center gap-3 opacity-80">
      <a class="btn" href={route("/")}>UWCS Elections</a>
      <!-- TODO: Replace with Logo -->
      <a class="btn" href={route("/election")}>Elections</a>
    </nav>
    <div class="flex items-center gap-4">
      {#if userID}
        <span>
          u{userID}
        </span>
        <SignOut>
          <div slot="submitButton" class="btn preset-tonal-primary">Logout</div>
        </SignOut>
      {:else}
        <SignIn provider="keycloak">
          <div slot="submitButton" class="btn preset-filled">Login</div>
        </SignIn>
      {/if}
    </div>
  </div>
</header>
