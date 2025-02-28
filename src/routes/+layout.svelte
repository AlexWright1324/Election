<script lang="ts">
  import ProgressBar from "$lib/components/ProgressBar.svelte"

  import Footer from "./Footer.svelte"
  import Header from "./Header.svelte"

  import "$lib/stylesheets/app.css"

  import { browser } from "$app/environment"
  import { ToastProvider } from "@skeletonlabs/skeleton-svelte"
  import { setContext } from "svelte"

  let { data, children } = $props()

  let bypass = $state({ value: data.bypass })
  setContext("bypass", bypass)
  $effect(() => {
    if (!browser) return
    document.cookie = `bypass=${bypass.value};path=/`
  })
</script>

<ProgressBar />

<ToastProvider>
  <Header user={data.session?.user} />
  <main class="mx-auto w-full max-w-screen-2xl min-w-0 p-4">
    {@render children()}
  </main>
  <Footer />
</ToastProvider>
