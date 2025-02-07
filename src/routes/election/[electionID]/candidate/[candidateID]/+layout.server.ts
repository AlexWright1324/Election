import { requireCandidate } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { error } from "@sveltejs/kit"

export const load = requireCandidate(
  {
    id: true,
    description: true,
    roles: {
      select: {
        name: true,
      },
    },
    users: {
      select: {
        userID: true,
        name: true,
      },
    },
  },
  async ({ candidate }) => {
    return {
      candidate,
    }
  }
)
