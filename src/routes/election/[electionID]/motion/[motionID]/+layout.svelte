<script lang="ts">
  import Tabs from "$lib/components/tabs/Tabs.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"

  let { data, children } = $props()
</script>

{#if data.motion.proposer.userID === data.session?.user.userID}
  {@const url = `/election/${data.election.id}/motion/${data.motion.id}`}
  <Tabs name="Motion Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/requests" badge={data.motion._count.seconderRequests}>Requests</TabItem>
  </Tabs>
{/if}

{@render children()}
