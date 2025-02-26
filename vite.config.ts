import type { KIT_ROUTES } from "$lib/ROUTES"

import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { kitRoutes } from "vite-plugin-kit-routes"

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    kitRoutes<KIT_ROUTES>({
      PAGES: {
        "/election/[electionID]/vote/confirm": {
          explicit_search_params: {
            signature: {
              required: true,
              type: "string",
            },
          },
        },
      },
    }),
  ],
  server: {
    watch: {
      ignored: ["**/.direnv**"],
    },
  },
})
