import { PrismaClient } from "$lib/server/db"
import { requireElectionAdmin } from "$lib/server/auth"

export const load = requireElectionAdmin(
  {
    id: true,
    name: true,
    description: true,
    start: true,
    end: true,
    candidateStart: true,
    candidateEnd: true,
    published: true,
    candidateDefaultDescription: true,
    candidateMaxDescription: true,
    candidateMaxUsers: true,
    motionEnabled: true,
    motionDefaultDescription: true,
    motionMaxDescription: true,
    motionMaxSeconders: true,
    roles: {
      select: {
        id: true,
        name: true,
        seatsToFill: true,
      },
    },
  },
  async ({ election }) => {
    return {
      election,
    }
  }
)
