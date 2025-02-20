<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from "./Label.svelte"

  import { Carta } from "carta-md"
  import { MarkdownEditor } from "carta-md"
  import DOMPurify from "dompurify"
  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, type FormFieldProxy } from "sveltekit-superforms"

  export const carta = new Carta({
    sanitizer: DOMPurify.sanitize,
  })

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

<label class="block w-0 min-w-full pb-2 pt-2">
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
