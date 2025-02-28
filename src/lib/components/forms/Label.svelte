<script lang="ts">
  let {
    name,
    errors,
  }: {
    name?: string
    errors: string[] | undefined
  } = $props()
</script>

<div class="text-sm">
  <p>{name}</p>
  {#if errors}
    <p class="text-error-500">⚠️ {errors}</p>
  {/if}
</div>
