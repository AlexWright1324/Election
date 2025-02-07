import { requireMotionAdmin } from "$lib/server/auth"

export const load = requireMotionAdmin(
  {
    name: true,
    description: true,
    seconderRequests: {
      select: {
        name: true,
        userID: true,
      },
    },
  },
  async ({ motion }) => {
    return {
      motion,
    }
  },
)
