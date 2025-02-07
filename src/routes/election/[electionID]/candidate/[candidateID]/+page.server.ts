import { requireAuth } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail } from "@sveltejs/kit"

export const load = async ({ parent, params }) => {
  const { session } = await parent()

  const invited = await PrismaClient.candidate.exists({
    id: Number(params.candidateID),
    userInvites: {
      some: {
        userID: session?.user.userID,
      },
    },
  })

  return {
    invited,
  }
}

export const actions = {
  acceptInvite: requireAuth(async ({ params, userID }) => {
    const candidateID = Number(params.candidateID)

    // TODO: check if there is overlap in roles or max candidancy

    await PrismaClient.candidate.update({
      where: {
        id: candidateID,
        userInvites: {
          some: {
            userID,
          },
        },
      },
      data: {
        users: {
          connect: {
            userID,
          },
        },
      },
    })
  }),
}
