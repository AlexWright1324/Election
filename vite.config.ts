import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { kitRoutes } from "vite-plugin-kit-routes"

//import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    //tailwindcss(),
    sveltekit(),
    kitRoutes(),
  ],
  server: {
    watch: {
      ignored: ["**/.direnv**"],
    },
  },
})
