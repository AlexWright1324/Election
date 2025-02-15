<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from "./Label.svelte"
  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, type FormFieldProxy } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T, number>
    name: string
  } & HTMLInputAttributes = $props()

  const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<number>
</script>

<label class="label">
  <Label {name} errors={$errors} />
  <input
    class="input"
    name={field}
    type="number"
    aria-invalid={$errors ? "true" : undefined}
    placeholder="Enter a number..."
    bind:value={$value}
    {...$constraints}
    {...restProps}
  />
</label>
