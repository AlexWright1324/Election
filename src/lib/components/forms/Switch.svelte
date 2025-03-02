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
    name?: string
    children?: Snippet
    enabledText?: Snippet
    disabledText?: Snippet
  } & HTMLInputAttributes = $props()

  const { value, errors, constraints } = formFieldProxy(superform, field) satisfies FormFieldProxy<boolean>
</script>

<label class="label border-b-surface-300-700 flex max-w-full items-center justify-between gap-2 border-b pt-2 pb-2">
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
    <Switch name={field} checked={$value} onCheckedChange={(e: { checked: boolean }) => ($value = e.checked)}>
      {#snippet inactiveChild()}
        <X size="14" />
      {/snippet}
      {#snippet activeChild()}
        <Check size="14" />
      {/snippet}
    </Switch>
  </div>
</label>
