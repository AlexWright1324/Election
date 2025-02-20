<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { onMount } from "svelte"
  import { flip } from "svelte/animate"
  import type { Writable } from "svelte/store"
  import { arrayProxy, type FormPathArrays, type SuperForm } from "sveltekit-superforms"

  const delay = 200
  const DIVIDER = "DIVIDER" as const

  type Candidate = { id: string; name: string; isRON: boolean }
  type ReturnedArray = { id: string }[]

  let {
    superform,
    name,
    candidates,
    field,
  }: {
    superform: SuperForm<T>
    name: string
    candidates: Candidate[]
    field: FormPathArrays<T, ReturnedArray>
  } = $props()

  const ronEnabled = candidates.some((candidate) => candidate.isRON)

  const { values: v, errors } = arrayProxy(superform, field)
  const values = v as Writable<ReturnedArray>

  let items = $state([DIVIDER, ...candidates])

  let draggedIndex: number | null = $state(null)
  let lastDrag = 0

  function handlePointerDown(index: number) {
    draggedIndex = index
  }

  function handlePointerMove(event: PointerEvent) {
    // Prevent dragging when pointer is released.
    if (event.buttons === 0) {
      draggedIndex = null
      return
    }

    if (draggedIndex === null) return
    if (event.timeStamp - lastDrag < delay) return

    const element = document.elementFromPoint(event.clientX, event.clientY)
    const tr = element?.closest("tr[data-index]")
    if (!tr) return

    const targetIndex = Number(tr.getAttribute("data-index"))
    if (targetIndex === draggedIndex) return

    // Avoid reordering when pointer is close to the mid-line.
    const rect = tr.getBoundingClientRect()
    const threshold = rect.height / 3
    const mid = rect.top + rect.height / 2
    if (
      (targetIndex < draggedIndex && event.clientY > mid + threshold) ||
      (targetIndex > draggedIndex && event.clientY < mid - threshold)
    ) {
      return
    }

    // Reorder items
    lastDrag = event.timeStamp
    const newItems = [...items]
    const [movedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, movedItem!)
    items = newItems
    draggedIndex = targetIndex

    // Update form values
    $values = newItems
      .slice(0, newItems.indexOf(DIVIDER))
      .filter((c): c is Candidate => typeof c !== "string")
      .map((c) => ({ id: c.id }))
  }

  // Prevent scrolling on touch devices
  let tbody: HTMLTableSectionElement
  onMount(() => {
    tbody.addEventListener(
      "touchstart",
      function (event) {
        event.preventDefault()
      },
      { passive: false },
    )
  })
</script>

<div>
  <div class="flex flex-wrap items-center gap-3">
    <h3 class="h3">{name}</h3>
    {#if $errors}
      <span class="text-error-500">⚠️ {$errors}</span>
    {/if}
  </div>

  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th class="w-0 opacity-0">||</th>
          <th>Rank</th>
          <th>Choice</th>
        </tr>
      </thead>
      <tbody
        bind:this={tbody}
        onpointermove={handlePointerMove}
        class="select-none {draggedIndex === null ? 'cursor-grab' : 'cursor-grabbing'}"
      >
        {#each items as item, index (typeof item === "string" ? item : item.id)}
          <tr animate:flip data-index={index} onpointerdown={() => handlePointerDown(index)}>
            {#if item === DIVIDER}
              <td class="opacity-0">||</td>
              <td colspan="3">
                {#if index === 0}
                  Drag candidates here to rank them.
                {:else if index === items.length - 1}
                  Drag candidates here to remove them.
                {:else}
                  Drag candidates above to rank or below to remove.
                {/if}
              </td>
            {:else}
              <td class="opacity-40">||</td>
              <td>
                {#if !items.slice(0, index).some((i) => i === DIVIDER)}
                  {index + 1}
                {/if}
              </td>
              <td>
                {#if item.isRON}
                  Re-Open Nominations
                  <!-- TODO: Include an info box here -->
                {:else}
                  {item.name}
                {/if}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
