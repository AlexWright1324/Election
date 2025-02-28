<script lang="ts">
  import { route } from "$lib/ROUTES"

  import type { Session } from "@auth/sveltekit"
  import { SignIn, SignOut } from "@auth/sveltekit/components"
  import { Switch } from "@skeletonlabs/skeleton-svelte"
  import { getContext } from "svelte"

  let {
    user,
  }: {
    user?: Session["user"]
  } = $props()

  const bypass: {
    value: boolean
  } = getContext("bypass")
</script>

<header class="border-surface-500/20 preset-filled-surface-100-900 w-full border-b-[1px] p-4 py-3">
  <div class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4">
    <nav class="flex items-center gap-3 opacity-80">
      <a class="btn" href={route("/")}>UWCS Elections</a>
    </nav>
    <div class="flex items-center gap-4">
      {#if user}
        {#if user.admin}
          <div class="preset-outlined-warning-500 flex items-center gap-2 rounded-xl p-1 font-bold">
            <span class="text-sm">Bypass</span>
            <Switch name="bypass" bind:checked={bypass.value} />
          </div>
        {/if}
        <span>
          {user.userID}
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
