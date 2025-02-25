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

  const { errors, constraints } = formFieldProxy(superform, field)
  const file = fileProxy(superform, field)
</script>

<label class="label pt-1 pb-1">
  <Label {name} errors={$errors} />
  <div class="banner-image-container preset-outlined-surface-300-700 p-[1px]">
    <img class="banner-image" {src} alt={name} />
  </div>
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
