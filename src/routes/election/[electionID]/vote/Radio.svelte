<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { onMount } from "svelte"
  import { formFieldProxy, type FormPathArrays, type FormPathLeaves, type SuperForm } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    options,
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T>
    name: string
    options: readonly (readonly [string, string])[]
  } = $props()

  const { value: group, errors } = formFieldProxy(superform, field)
</script>

<div>
  <div class="flex flex-wrap items-center gap-3">
    <h3 class="h3">{name}</h3>
    {#if $errors}
      <span class="text-error-500">⚠️ {$errors}</span>
    {/if}
  </div>
  {#each options as [value, label]}
    <label class="flex items-center gap-2">
      <input class="radio" type="radio" name={field} {value} bind:group={$group} />
      <p>{label}</p>
    </label>
  {/each}
</div>
