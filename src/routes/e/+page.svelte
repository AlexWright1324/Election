<script lang="ts">
	import { onMount } from "svelte"

	let currentDateTime = $state(new Date())

	onMount(() => {
		const interval = setInterval(() => {
			currentDateTime = new Date()
		}, 1000)

		return () => {
			clearInterval(interval)
		}
	})

	function formatTimeDiff(date1: Date, date2: Date) {
		// Add 1s because starting in 0s is silly
		const msDiff = Math.abs(date1.getTime() - date2.getTime()) + 1000

		let totalSeconds = Math.floor(msDiff / 1000)
		const days = Math.floor(totalSeconds / (3600 * 24))
		totalSeconds %= 3600 * 24
		const hours = Math.floor(totalSeconds / 3600)
		totalSeconds %= 3600
		const minutes = Math.floor(totalSeconds / 60)
		const seconds = totalSeconds % 60

		// Create an array to store non-zero values
		const timeString = []

		if (days > 0) timeString.push(`${days} day${days > 1 ? "s" : ""}`)
		if (hours > 0) timeString.push(`${hours} hour${hours > 1 ? "s" : ""}`)
		if (minutes > 0) timeString.push(`${minutes} minute${minutes > 1 ? "s" : ""}`)
		if (seconds > 0 || timeString.length === 0)
			timeString.push(`${seconds} second${seconds > 1 ? "s" : ""}`)

		return timeString.join(", ")
	}

	let { data } = $props()
</script>

<h1>Elections</h1>
<a href="/e/new">Create New Election</a>

<ul>
	{#each data.elections as election}
		<li>
			<a href="/e/{election.id}">
				<h3>{election.name}</h3>
				{#if election.candidateStart && election.candidateEnd}
					{#if election.candidateStart > currentDateTime}
						<p>
							Candidate signups start in {formatTimeDiff(election.candidateStart, currentDateTime)}
						</p>
					{:else if election.candidateEnd > currentDateTime}
						<p>Candidate signups end in {formatTimeDiff(election.candidateEnd, currentDateTime)}</p>
					{/if}
				{/if}
				{#if election.start && election.end}
					{#if election.start > currentDateTime}
						<p>Election starts in {formatTimeDiff(election.start, currentDateTime)}</p>
					{:else if election.end > currentDateTime}
						<p>Election ends in {formatTimeDiff(election.end, currentDateTime)}</p>
					{:else}
						<p>Election is over</p>
					{/if}
				{/if}
			</a>
		</li>
	{/each}
</ul>
