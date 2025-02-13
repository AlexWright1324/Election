<script lang="ts">
  import Footer from "$lib/components/Footer.svelte"
  import Header from "$lib/components/Header.svelte"
  import ProgressBar from "$lib/components/ProgressBar.svelte"

  import "$lib/stylesheets/app.css"

  import { ToastProvider } from "@skeletonlabs/skeleton-svelte"

  let { data, children } = $props()
</script>

<ProgressBar />

<ToastProvider>
  <Header userID={data.session?.user.userID} />
  <main class="max-w-screen-2xl w-full min-w-0 mx-auto p-4">
    {@render children()}
  </main>
  <Footer />
</ToastProvider>
