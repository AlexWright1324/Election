export function formatTimeDiff(date1: Date, date2: Date) {
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
