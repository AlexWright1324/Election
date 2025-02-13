<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { carta } from "$lib/client/carta"

  import Label from "./Label.svelte"
  import { MarkdownEditor } from "carta-md"
  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, type FormFieldProxy } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T, string>
    name: string
  } & HTMLInputAttributes = $props()

  const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<string>
</script>

<label class="label">
  <Label {name} errors={$errors} />
  <input
    type="hidden"
    name={field}
    aria-invalid={$errors ? "true" : undefined}
    bind:value={$value}
    {...$constraints}
    {...restProps}
  />
  <MarkdownEditor {carta} mode="tabs" bind:value={$value} />
</label>
