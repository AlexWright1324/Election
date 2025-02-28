<script lang="ts">
  import { date } from "$lib/client/time.svelte"
  import TabItem from "$lib/components/tabs/TabItem.svelte"
  import Tabs from "$lib/components/tabs/Tabs.svelte"

  import { route } from "$lib/ROUTES"

  import { page } from "$app/state"

  let { data, children } = $props()

  let tabs = $derived([
    ["Settings", ""],
    ["Roles", "/roles", data.election.start ? !(data.election.start < date.now) : true],
    ["Candidates", "/candidates"],
    ["Motions", "/motions", data.election.motionEnabled],
    ["Members", "/members"],
  ] as const)
</script>

<Tabs>
  {#each tabs as [name, ext, test]}
    {@const url = `/election/[electionID]/edit${ext}` as const}
    {@const href = route(url, { electionID: page.params.electionID! })}
    <TabItem {href} locked={test === false}>{name}</TabItem>
  {/each}
</Tabs>

{@render children()}
