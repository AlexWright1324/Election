<script lang="ts">
  import BackToElection from "$lib/components/BackToElection.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import Tabs from "$lib/components/tabs/Tabs.svelte"

  let { data, children } = $props()
</script>

<BackToElection electionID={data.candidate.role.election.id} />

{#if data.isCandidateAdmin}
  {@const url = `/candidate/${data.candidate.id}`}
  <Tabs name="Candidate Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/invite">Invite</TabItem>
  </Tabs>
{/if}

{@render children()}
