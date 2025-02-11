// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: import("@auth/sveltekit").Session["user"]
      db: typeof import("$lib/server/db").PrismaClient
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    namespace SuperForms {
      type Message = {
        type: "error" | "success"
        text: string
      }
    }
  }
}

export {}
