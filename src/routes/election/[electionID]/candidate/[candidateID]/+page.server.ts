import type { PageServerLoad } from "./$types"
import { fail } from "@sveltejs/kit"

import { PrismaClient } from "$lib/server/db"

export const load: PageServerLoad = async ({ parent, params }) => {
  const { session } = await parent()

  const invited = await PrismaClient.candidateInvite.exists({
    candidateID: Number(params.candidateID),
    userID: session?.user.userID,
  })

  return {
    invited,
  }
}

export const actions = {
  acceptInvite: async ({ locals, params }) => {
    const session = await locals.auth()

    if (!session?.user.userID) {
      return fail(403, { message: "You are not logged in" })
    }

    const candidateID = Number(params.candidateID)
    await PrismaClient.$transaction(async (tx) => {
      const userIsCandidate = await tx.candidate.exists({
        users: {
          some: {
            userID: session.user.userID,
          },
        },
      })

      if (userIsCandidate) {
        return fail(400, { message: "User is already a candidate" })
      }

      await tx.candidateInvite.delete({
        where: {
          candidateID_userID: {
            candidateID,
            userID: session.user.userID,
          },
        },
      })

      await tx.candidate.update({
        where: { id: candidateID },
        data: {
          users: {
            connect: {
              userID: session.user.userID,
            },
          },
        },
      })
    })

    return { message: "You have been added as a candidate" }
  },
}
