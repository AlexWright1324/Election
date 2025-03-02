import { UserCanRequestSecondMotion } from "$lib/client/checks.js"
import { requireMotion } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail } from "@sveltejs/kit"

export const load = requireMotion(
  {
    id: true,
    name: true,
    description: true,
    election: {
      select: {
        start: true,
        motionMaxSeconders: true,
      },
    },
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
  async ({ motion, locals }) => {
    const motionData = {
      ...motion,
      requested: await PrismaClient.motion.exists({
        id: motion.id,
        seconderRequests: {
          some: {
            userID: locals.session?.user.userID ?? "",
          },
        },
      }),
    }

    return {
      motion: motionData,
    }
  },
)

export const actions = {
  second: requireMotion(
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
    async ({ motion, locals }) => {
      const motionData = {
        ...motion,
        requested: await PrismaClient.motion.exists({
          id: motion.id,
          seconderRequests: {
            some: {
              userID: locals.session?.user.userID ?? "",
            },
          },
        }),
      }
      const canRequestSecond = UserCanRequestSecondMotion(motionData, locals.session?.user, new Date())
      if (!canRequestSecond.allow) {
        return fail(403, { message: canRequestSecond.error })
      }

      await PrismaClient.motion.update({
        where: { id: motion.id },
        data: {
          seconderRequests: {
            connect: {
              userID: locals.session?.user.userID,
            },
          },
        },
      })
    },
  ),
}
