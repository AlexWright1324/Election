<script lang="ts">
  import Tabs from "$lib/components/tabs/Tabs.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"


  let { data, children } = $props()
</script>

{#if data.election.admins.some(admin => admin.userID === data.session?.user.userID)}
  {@const url = `/election/${data.election.id}`}
  <Tabs name="Election Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/roles">Roles</TabItem>
  </Tabs>
{/if}

{@render children()}