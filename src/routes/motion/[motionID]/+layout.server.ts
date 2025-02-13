import { requireMotion } from "$lib/server/auth"

export const load = requireMotion(
  {
    id: true,
    proposer: {
      select: {
        userID: true,
      },
    },
    election: {
      select: {
        id: true,
      },
    },
    _count: {
      select: {
        seconderRequests: true,
      },
    },
  },
  async ({ motion, locals }) => {
    const isProposer = motion.proposer.userID === locals.session?.user.userID

    return {
      motion,
      isProposer,
    }
  },
)
