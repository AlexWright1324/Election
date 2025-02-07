import { requireAuth, requireMotion } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail } from "@sveltejs/kit"

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
      },
      async ({ motion, userID }) => {
        if (motion.proposer.userID === userID) {
          return fail(400, { message: "You cannot second your own motion" })
        }

        if (motion.seconders.some((seconder) => seconder.userID === userID)) {
          return fail(400, { message: "You have already seconded this motion" })
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
