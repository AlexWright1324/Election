<script lang="ts">
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import Tabs from "$lib/components/tabs/Tabs.svelte"

  import { ArrowLeft } from "lucide-svelte"

  let { data, children } = $props()
</script>

<div>
  <a class="btn" href="/election/{data.motion.election.id}">
    <div class="flex gap-2 items-center">
      <ArrowLeft size="1.25em" />
      <span>Back to Election</span>
    </div>
  </a>
</div>

{#if data.motion.proposer.userID === data.session?.user.userID}
  {@const url = `/motion/${data.motion.id}`}
  <Tabs name="Motion Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/requests" badge={data.motion._count.seconderRequests}>Requests</TabItem>
  </Tabs>
{/if}

{@render children()}
