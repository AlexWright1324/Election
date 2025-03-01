<script lang="ts">
  import Results from "./Results.svelte"

  import { route } from "$lib/ROUTES"

  import { Accordion } from "@skeletonlabs/skeleton-svelte"
  import { ClipboardList } from "lucide-svelte"

  let { data } = $props()
</script>

<a
  class="btn preset-filled-primary-500"
  href={route("GET /election/[electionID]/results/proof", { electionID: data.election.id })}
  download
>
  Download Proof of Election
</a>

<!-- TODO: Display current state of election -->
<!-- TODO: Publish Results Button -->

<p>Votes: {data.numVotes}</p>
<Results
  motions={data.results.motions.map((m) => ({
    name: m.name,
    result: m.results,
  }))}
  roles={data.results.roles.map((r) => ({
    name: r.name,
    seatsToFill: r.seatsToFill,
    result: {
      droopQuota: r.droopQuota,
      winners: r.winners,
      rounds: r.rounds.map((round) => ({
        candidates: round.candidates,
      })),
    },
  }))}
/>
