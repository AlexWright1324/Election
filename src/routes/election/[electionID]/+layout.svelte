<script lang="ts">
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import Tabs from "$lib/components/tabs/Tabs.svelte"

  let { data, children } = $props()
</script>

{#if data.election.isAdmin}
  {@const url = `/election/${data.election.id}`}
  <Tabs name="Election Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/roles">Roles</TabItem>
    <TabItem href="{url}/edit/members">Members</TabItem>
    <TabItem href="{url}/results">Results</TabItem>
  </Tabs>
{/if}

{@render children()}
