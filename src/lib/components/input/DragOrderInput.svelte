<script lang="ts">
  import { seperateJoin } from "$lib/client/separate"
  import { onMount } from "svelte"
  import { flip } from "svelte/animate"

  const delay = 200

  const SpecialItem = {
    DIVIDER: {
      id: -2,
      name: "",
    },
    RON: {
      id: -1,
      name: "",
    },
  }

  let {
    candidates,
    value = $bindable([]),
    ron = false,
  }: {
    candidates: { id: number; users: { name: string }[] }[]
    value: { id: number }[]
    ron: boolean
  } = $props()

  let items = $state([
    SpecialItem.DIVIDER,
    SpecialItem.RON,
    ...candidates.map((c) => {
      return {
        id: c.id,
        name: seperateJoin(c.users.map((user) => user.name)),
      }
    }),
  ])

  let draggedIndex: number | null = $state(null)
  let lastDrag = 0

  function handlePointerDown(index: number) {
    draggedIndex = index
  }

  function handlePointerMove(event: PointerEvent) {
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

    if (targetIndex !== draggedIndex) {
      lastDrag = event.timeStamp
      const newItems = [...items]
      const [movedItem] = newItems.splice(draggedIndex, 1)
      newItems.splice(targetIndex, 0, movedItem)
      items = newItems
      draggedIndex = targetIndex

      // Set form value to ranked items
      const rankedItems = items.slice(
        0,
        items.findIndex((item) => item.id === SpecialItem.DIVIDER.id),
      )
      value = rankedItems.map((item) => ({ id: item.id }))
    }
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

<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>
        <th class="opacity-0 w-0">||</th>
        <th>Rank</th>
        <th>Choice</th>
      </tr>
    </thead>
    <tbody
      bind:this={tbody}
      onpointermove={handlePointerMove}
      class="select-none {draggedIndex === null ? 'cursor-grab' : 'cursor-grabbing'}"
    >
      {#each items as item, index (item.id)}
        <tr animate:flip data-index={index} onpointerdown={() => handlePointerDown(index)}>
          {#if item.id !== SpecialItem.DIVIDER.id}
            <td class="opacity-40">||</td>
            <td>
              {#if !items.slice(0, index).some((i) => i.id === SpecialItem.DIVIDER.id)}
                {index + 1}
              {/if}
            </td>
            {#if item.id == SpecialItem.RON.id}
              <td>(RON) Reopen Nominations</td>
            {:else}
              <td>{item.name}</td>
            {/if}
          {:else}
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
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
