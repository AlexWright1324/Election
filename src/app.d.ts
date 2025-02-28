// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: import("@auth/sveltekit").Session | null
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  namespace PrismaJson {
    type RoleResult = {
      droopQuota: number
      winners: {
        id: string
        name: string
      }[]
      rounds: {
        candidates: {
          id: string
          name: string
          status?: "winner" | "eliminated"
          tally?: number
        }[]
      }[]
    }
    type MotionResult = {
      for: number
      against: number
      abstain: number
    }
  }
}

export {}
