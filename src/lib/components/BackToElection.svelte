<script lang="ts">
  import { route } from "$lib/ROUTES"

  import { ArrowLeft } from "lucide-svelte"

  let {
    electionID,
  }: {
    electionID: string
  } = $props()
</script>

<div>
  <a class="btn" href={route("/election/[electionID]", { electionID })}>
    <div class="flex items-center gap-2">
      <ArrowLeft size="1.25em" />
      <span>Back to Election</span>
    </div>
  </a>
</div>
