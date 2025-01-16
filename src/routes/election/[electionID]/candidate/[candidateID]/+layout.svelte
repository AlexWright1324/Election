<script lang="ts">
  import Tabs from "$lib/components/tabs/Tabs.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"

  let { data, children } = $props()
</script>

{#if data.candidateAdmin}
  {@const url = `/election/${data.election.id}/candidate/${data.candidate.id}`}
  <Tabs name="Candidate Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/invite">Invite</TabItem>
  </Tabs>
{/if}

{@render children()}
