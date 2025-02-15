import { emptySchema } from "$lib/client/schema"
import { requireAuth } from "$lib/server/auth"
import { Prisma, PrismaClient } from "$lib/server/db"

import { redirect } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ parent }) => {
  const { session } = await parent()

  const select: Prisma.ElectionSelect = {
    id: true,
    name: true,
    start: true,
    end: true,
    signUpEnd: true,
    published: true,
    imageVersion: true,
    membersOnly: true,
  }

  const elections = await PrismaClient.election.findMany({
    where: {
      published: true,
    },
    select,
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
        select,
      })
    : []

  return {
    elections,
    managedElections,
    createForm: await superValidate(zod(emptySchema)),
  }
}

export const actions = {
  create: requireAuth(async ({ request, userID }) => {
    const form = await superValidate(request, zod(emptySchema))
    if (!form.valid) return fail(400, { form })

    try {
      const election = await PrismaClient.election.create({
        data: {
          admins: {
            connect: {
              userID,
            },
          },
        },
      })

      return redirect(303, `/election/${election.id}`)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return setError(form, "", error.message)
      }
      throw error
    }
  }),
}
