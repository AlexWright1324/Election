import { PrismaClient } from "$lib/server/db"
import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { requireAuth } from "$lib/server/auth"

export const load: PageServerLoad = async ({ parent }) => {
  const { session } = await parent()

  const elections = await PrismaClient.election.findMany({
    where: {
      published: true,
    },
  })
  
  const managedElections = session?.user.userID
    ? await PrismaClient.election.findMany({
        where: {
          admins: {
            some: {
              userID: session.user.userID,
            },
          },
        },
      })
    : []

  return {
    elections,
    managedElections,
  }
}

export const actions = {
  create: requireAuth(async ({ userID }) => {
    const election = await PrismaClient.election.create({
      data: {
        admins: {
          connect: {
            userID
          },
        },
      },
    })

    return redirect(303, `/election/${election.id}`)
  }),
}
