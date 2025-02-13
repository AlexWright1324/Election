import { seperateJoin } from "$lib/client/separate"

export const date = $state({
  now: new Date(),
})

setInterval(() => {
  date.now = new Date()
}, 1000)

function secondsDiff(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / 1000
}

function humanReadableTime(startingSeconds: number, units: number = 1) {
  let remaining = startingSeconds

  const days = Math.floor(remaining / (3600 * 24))
  remaining %= 3600 * 24
  const hours = Math.floor(remaining / 3600)
  remaining %= 3600
  const minutes = Math.floor(remaining / 60)
  remaining %= 60
  const seconds = Math.floor(remaining)

  const plural = (time: number) => (time > 1 ? "s" : "")
  const pluralise = (time: number, unit: string) => `${unit}${plural(time)}`

  // Create an array of time units
  const timeArray = [
    days ? `${days} ${pluralise(days, "day")}` : "",
    hours ? `${hours} ${pluralise(hours, "hour")}` : "",
    minutes ? `${minutes} ${pluralise(minutes, "minute")}` : "",
    seconds ? `${seconds} ${pluralise(seconds, "second")}` : "",
  ].filter((time) => time !== "")
  console.log(timeArray)

  return seperateJoin(timeArray.slice(0, units))
}

export function humanReadableTimeDiff(start: Date, end: Date, units: number = 3) {
  const diff = secondsDiff(start, end)
  return humanReadableTime(diff, units)
}
