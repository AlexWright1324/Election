<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves } from "sveltekit-superforms"

  let {
    superform,
    field,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T>
  } & HTMLInputAttributes = $props()

  const { value, constraints } = formFieldProxy(superform, field)
</script>

<label class="label">
  <input name={field} type="hidden" bind:value={$value} {...$constraints} {...restProps} />
</label>
