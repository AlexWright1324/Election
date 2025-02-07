<script lang="ts">
  import { carta } from "$lib/client/carta"
  import { MarkdownEditor } from "carta-md"

  let {
    label = "Description",
    inputName = "description",
    value = $bindable(""),
  }: {
    label?: string
    inputName?: string
    value: string
  } = $props()
</script>

<label class="label">
  <span class="label-text">{label}</span>
  <input type="hidden" name={inputName} />
  <MarkdownEditor {carta} bind:value mode="tabs" />
</label>
