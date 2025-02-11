import { Prisma } from "@prisma/client"
import { redirect } from "@sveltejs/kit"
import { superValidate, fail, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const emptySchema = z.object({})

export const load = async ({ locals }) => {
  const elections = await locals.db.election.findMany()

  const managedElections = locals.user?.userID
    ? await locals.db.election.findMany({
        where: {
          admins: {
            some: {
              userID: locals.user.userID,
            },
          },
        },
      })
    : []

  return {
    elections,
    managedElections,
    createElectionForm: await superValidate(zod(emptySchema)),
  }
}

export const actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(emptySchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      const election = await locals.db.election.create({
        select: {
          id: true,
        },
        data: {
          admins: {
            connect: {
              userID: locals.user?.userID,
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
