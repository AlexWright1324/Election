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
    type Results = {
      roles: {
        name: string
        seatsToFill: number
        droopQuota: number
        winners: {
          id: string
          name: string
        }[]
        rounds: {
          candidates: {
            name: string
            status?: "winner" | "eliminated"
            tally?: number
            id: string
          }[]
        }[]
      }[]
      motions: {
        name: string
        results: {
          for: number
          against: number
          abstain: number
        }
      }[]
    }
  }
}

export {}
