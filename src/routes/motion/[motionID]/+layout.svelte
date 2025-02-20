<script lang="ts">
  import BackToElection from "$lib/components/BackToElection.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import Tabs from "$lib/components/tabs/Tabs.svelte"

  let { data, children } = $props()
</script>

<BackToElection electionID={data.motion.election.id} />

{#if data.motion.proposer.userID === data.session?.user.userID}
  {@const url = `/motion/${data.motion.id}`}
  <Tabs name="Motion Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/requests" badge={data.motion._count.seconderRequests}>Requests</TabItem>
  </Tabs>
{/if}

{@render children()}
