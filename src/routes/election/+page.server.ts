import { PrismaClient } from "$lib/server/db"
import { fail, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ parent }) => {
  const { session } = await parent()

  const elections = await PrismaClient.election.findMany({
    where: {
      published: true,
    },
  })
  const managedElections = session?.user.uniID
    ? await PrismaClient.election.findMany({
        where: {
          admins: {
            some: {
              uniID: session.user.uniID,
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
  create: async ({ locals }) => {
    const session = await locals.auth()

    if (!session?.user?.uniID) {
      return fail(403, { message: "You are not logged in" })
    }

    const election = await PrismaClient.election.create({
      data: {
        admins: {
          connect: {
            uniID: session.user.uniID,
          },
        },
      },
    })

    return redirect(303, `/election/${election.id}`)
  },
}
