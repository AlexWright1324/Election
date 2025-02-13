<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from "./Label.svelte"
  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, fileProxy } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    src,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T>
    name: string
    src: string
  } & HTMLInputAttributes = $props()

  const { value, errors, constraints } = formFieldProxy(superform, field)
  const file = fileProxy(superform, field)
</script>

<label class="label max-w-xs">
  <Label {name} errors={$errors} />
  <img class="p-4 preset-outlined-primary-200-800" {src} alt={name} />
  <input
    class="input"
    name="image"
    type="file"
    accept="image/*"
    aria-invalid={$errors ? "true" : undefined}
    bind:files={$file}
    {...$constraints}
    {...restProps}
  />
</label>
