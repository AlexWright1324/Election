<script lang="ts">
  import type { Snippet } from "svelte"

  function handleMouseDown(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    offset = {
      x: event.clientX - x,
      y: event.clientY - y,
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  function handleMouseMove(event: MouseEvent) {
    if (offset) {
      // Limit the drag to the window
      const maxX = window.innerWidth - clientWidth - 2
      const maxY = window.innerHeight - clientHeight - 2
      x = Math.min(Math.max(event.clientX - offset.x, 0), maxX)
      y = Math.min(Math.max(event.clientY - offset.y, 0), maxY)
    }
  }

  function handleMouseUp() {
    offset = null
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
  }

  // svelte-ignore non_reactive_update
  let clientHeight: number, clientWidth: number
  let offset: null | { x: number; y: number } = null
  let x = $state(0),
    y = $state(0)

  let {
    children,
    header = "Drag me",
    open = $bindable(true),
  }: {
    children?: Snippet
    header?: String
    open: boolean
  } = $props()
</script>

{#if open}
  <div
    bind:clientHeight
    bind:clientWidth
    class="preset-outlined-surface-200-800 rounded-base absolute min-w-64"
    style="top: {y}px; left: {x}px;"
  >
    <div
      class="preset-filled-surface-200-800 flex cursor-pointer items-center justify-between p-1 pl-4"
      role="button"
      tabindex="-1"
      onmousedown={handleMouseDown}
    >
      <p>{header}</p>
      <button class="preset-filled-surface-200-800 btn" onclick={() => (open = false)}>X</button>
    </div>
    <div class="preset-filled-surface-100-900 min-h-10">
      {@render children?.()}
    </div>
  </div>
{/if}
