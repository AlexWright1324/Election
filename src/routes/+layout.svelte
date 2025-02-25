<script lang="ts">
  import Footer from "$lib/components/Footer.svelte"
  import Header from "$lib/components/Header.svelte"
  import ProgressBar from "$lib/components/ProgressBar.svelte"

  import "$lib/stylesheets/app.css"

  import { Switch, ToastProvider } from "@skeletonlabs/skeleton-svelte"

  let { data, children } = $props()
</script>

<ProgressBar />

<ToastProvider>
  <Header userID={data.session?.user.userID} />
  <main class="mx-auto w-full max-w-screen-2xl min-w-0 p-4">
    {@render children()}
  </main>
  <Footer />
</ToastProvider>
