<script lang="ts">
  let {
    name,
    errors,
  }: {
    name: string
    errors: string[] | undefined
  } = $props()
</script>

<div class="label-text flex gap-2">
  <span>{name}</span>
  {#if errors}
    <span class="text-error-500">⚠️ {errors}</span>
  {/if}
</div>
