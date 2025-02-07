<script lang="ts" module>
  let updatedTime = $state(Date.now())

  export function updateImage() {
    updatedTime = Date.now()
  }
</script>

<script lang="ts">
  let {
    label = "Image",
    inputName = "image",
    file = $bindable(),
    alt,
    src,
  }: {
    label?: string
    inputName?: string
    file?: File
    alt: string
    src: string
  } = $props()

  let srcUpdated = $derived(`${src}?_=${updatedTime}`)
</script>

<label class="label">
  <span class="label-text">{label}</span>
  <img class="m-4 max-w-[320px] max-h-[320px] preset-outlined-primary-200-800" src={srcUpdated} {alt} />
  <input
    class="input"
    type="file"
    accept="image/*"
    name={inputName}
    oninput={(e) => (file = e.currentTarget.files?.item(0) as File)}
  />
</label>
