<script lang="ts">
  import Tabs from "$lib/components/tabs/Tabs.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import type { PageData } from "./$types"
  import type { Snippet } from "svelte"

  let {
    data,
    children,
  }: {
    data: PageData
    children: Snippet
  } = $props()
</script>

{#if data.election.admins.some((admin) => admin.userID === data.session?.user.userID)}
  {@const url = `/election/${data.election.id}`}
  <Tabs name="Election Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/roles">Roles</TabItem>
    <TabItem href="{url}/edit/members">Members</TabItem>
  </Tabs>
{/if}

{@render children?.()}
