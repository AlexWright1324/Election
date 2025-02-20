<script lang="ts" module>
  type T = Record<string, unknown>
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from "$lib/components/forms/Label.svelte"

  import { Switch } from "@skeletonlabs/skeleton-svelte"
  import { X, Check } from "lucide-svelte"
  import type { Snippet } from "svelte"
  import type { HTMLInputAttributes } from "svelte/elements"
  import { fade } from "svelte/transition"
  import { formFieldProxy, type SuperForm, type FormPathLeaves, type FormFieldProxy } from "sveltekit-superforms"

  let {
    superform,
    field,
    name,
    children,
    enabledText,
    disabledText,
    ...restProps
  }: {
    superform: SuperForm<T>
    field: FormPathLeaves<T, boolean>
    name: string
    children?: Snippet
    enabledText?: Snippet
    disabledText?: Snippet
  } & HTMLInputAttributes = $props()

  const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<boolean>
</script>

<label class="label flex max-w-full justify-between gap-2 border-b pb-2 pt-2 border-b-surface-300-700">
  <div>
    <Label {name} errors={$errors} />
    <div class="label-text opacity-80">
      {@render children?.()}
      {#if $value}
        <div in:fade={{ duration: 200 }}>
          {@render enabledText?.()}
        </div>
      {:else}
        <div in:fade={{ duration: 200 }}>
          {@render disabledText?.()}
        </div>
      {/if}
    </div>
  </div>
  <div>
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
  </div>
</label>
