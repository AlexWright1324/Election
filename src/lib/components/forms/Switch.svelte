<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from "./Label.svelte"
  import { Switch } from "@skeletonlabs/skeleton-svelte"
  import { X, Check } from "lucide-svelte"
  import type { HTMLInputAttributes } from "svelte/elements"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, type FormFieldProxy } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T, boolean>
    name: string
  } & HTMLInputAttributes = $props()

  const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<boolean>
</script>

<label class="label">
  <Label {name} errors={$errors} />
  <input
    name={field}
    type="hidden"
    aria-invalid={$errors ? "true" : undefined}
    bind:value={$value}
    {...$constraints}
    {...restProps}
  />
  <Switch name={field} bind:checked={$value}>
    {#snippet inactiveChild()}
      <X size="1em" />
    {/snippet}
    {#snippet activeChild()}
      <Check size="1em" />
    {/snippet}
  </Switch>
</label>
