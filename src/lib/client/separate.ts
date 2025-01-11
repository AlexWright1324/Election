export const seperateJoin = (items: string[]) => {
  const seperated = items.slice(0, -1).join(", ")
  return [seperated, items[items.length - 1]].filter(Boolean).join(" and ")
}
