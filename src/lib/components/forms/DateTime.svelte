<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from "./Label.svelte"

  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, dateProxy } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T>
    name?: string
  } & HTMLInputAttributes = $props()

  const { errors, constraints } = formFieldProxy(superform, field)
  const proxyDate = dateProxy(superform, field, { format: "datetime-local" })
</script>

<label class="label pt-1 pb-1">
  <Label {name} errors={$errors} />
  <input
    class="input"
    name={field}
    type="datetime-local"
    aria-invalid={$errors ? "true" : undefined}
    bind:value={$proxyDate}
    {...$constraints}
    {...restProps}
  />
</label>
