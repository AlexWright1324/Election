import { UserCanSecondMotion } from "$lib/client/checks.js"
import { requireAuth, requireMotion } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail } from "@sveltejs/kit"

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
  },
  async ({ motion }) => {
    return {
      motion,
    }
  },
)

export const actions = {
  second: requireAuth(
    requireMotion(
      {
        id: true,
        proposer: {
          select: {
            userID: true,
          },
        },
        seconders: {
          select: {
            userID: true,
          },
        },
        election: {
          select: {
            start: true,
            motionMaxSeconders: true,
          },
        },
      },
      async ({ motion, userID }) => {
        if (!UserCanSecondMotion(motion, userID, new Date())) {
          return fail(403, { message: "You can't second this motion" })
        }

        await PrismaClient.motion.update({
          where: { id: motion.id },
          data: {
            seconderRequests: {
              connect: {
                userID,
              },
            },
          },
        })
      },
    ),
  ),
}
