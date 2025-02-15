import theme from "./src/lib/stylesheets/theme"
import { skeleton, contentPath } from "@skeletonlabs/skeleton/plugin"
import forms from "@tailwindcss/forms"
import typography from "@tailwindcss/typography"
import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{html,js,svelte,ts}", contentPath(import.meta.url, "svelte")],
  theme: {
    extend: {},
  },
  plugins: [
    forms,
    typography,
    skeleton({
      // NOTE: each theme included will increase the size of your CSS bundle
      themes: [theme],
    }),
  ],
} satisfies Config
