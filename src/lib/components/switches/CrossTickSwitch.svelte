<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte"
  import { X, Check } from "lucide-svelte"

  let { name, checked = $bindable() }: { name: string; checked: boolean | undefined } = $props()
</script>

<Switch {name} bind:checked>
  {#snippet inactiveChild()}
    <X size="1em" />
  {/snippet}
  {#snippet activeChild()}
    <Check size="1em" />
  {/snippet}
</Switch>
