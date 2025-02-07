import { requireMotion } from "$lib/server/auth"

export const load = requireMotion(
  {
    id: true,
    name: true,
    description: true,
    proposer: {
      select: {
        name: true,
        userID: true,
      },
    },
    seconders: {
      select: {
        name: true,
        userID: true,
      },
    },
    _count: {
      select: {
        seconderRequests: true
      }
    }
  },
  async ({ motion }) => {
    return {
      motion,
    }
  },
)
