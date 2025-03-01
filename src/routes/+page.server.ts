import { UserCanCreateElection } from "$lib/client/checks"
import { emptySchema } from "$lib/client/schema"
import { ElectionIsVisible, isElectionAdmin } from "$lib/server/checks"
import { Prisma, PrismaClient } from "$lib/server/db"

import { redirect } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = async ({ locals }) => {
  const select: Prisma.ElectionSelect = {
    id: true,
    name: true,
    start: true,
    end: true,
    nominationsStart: true,
    nominationsEnd: true,
    imageVersion: true,
    membersOnly: true,
  }

  const elections = await PrismaClient.election.findMany({
    where: {
      AND: [ElectionIsVisible(locals.session?.user.userID)],
    },
    select,
  })

  const managedElections = await PrismaClient.election.findMany({
    where: {
      AND: [isElectionAdmin(locals.session?.user.userID)],
    },
    select,
  })

  return {
    elections,
    managedElections,
    createForm: await superValidate(zod(emptySchema)),
  }
}

export const actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(emptySchema))
    if (!form.valid) return fail(400, { form })

    const canCreate = UserCanCreateElection(locals.session?.user)
    if (canCreate.allow === undefined) {
      return setError(form, "", canCreate.error)
    }

    try {
      const election = await PrismaClient.election.create({
        data: {
          admins: {
            connect: {
              userID: locals.session?.user.userID,
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
  },
}
