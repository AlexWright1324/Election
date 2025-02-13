<script lang="ts">
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import Tabs from "$lib/components/tabs/Tabs.svelte"

  import { ArrowLeft } from "lucide-svelte"

  let { data, children } = $props()
</script>

<div>
  <a class="btn" href="/election/{data.candidate.role.election.id}">
    <div class="flex gap-2 items-center">
      <ArrowLeft size="1.25em" />
      <span>Back to Election</span>
    </div>
  </a>
</div>

{#if data.isCandidateAdmin}
  {@const url = `/candidate/${data.candidate.id}`}
  <Tabs name="Candidate Admin">
    <TabItem href={url}>Preview</TabItem>
    <TabItem href="{url}/edit">Edit</TabItem>
    <TabItem href="{url}/edit/invite">Invite</TabItem>
  </Tabs>
{/if}

{@render children()}
