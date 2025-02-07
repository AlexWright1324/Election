import { requireAuth, requireElection } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { redirect } from "@sveltejs/kit"

export const actions = {
  create: requireAuth(
    requireElection({ id: true, motionDefaultDescription: true }, async ({ params, userID, election }) => {
      const motion = await PrismaClient.motion.create({
        data: {
          election: {
            connect: {
              id: election.id,
            },
          },
          proposer: {
            connect: {
              userID,
            },
          },
          description: election.motionDefaultDescription,
        },
        select: {
          id: true,
        },
      })

      return redirect(303, `/election/${election.id}/motion/${motion.id}`)
    }),
  ),
}
