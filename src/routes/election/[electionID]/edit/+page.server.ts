import { requireElectionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { deleteElection } from "$lib/server/election"
import { storeElectionCoverImage, zImage } from "$lib/server/store"

import { Prisma } from "@prisma/client"
import { redirect } from "@sveltejs/kit"
import { message, superValidate, fail, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string(),
  description: z.string(),
  start: z.date().nullable(),
  end: z.date().nullable(),
  signUpEnd: z.date().nullable(),
  published: z.boolean(),
  image: zImage,
  candidateDefaultDescription: z.string(),
  candidateMaxDescription: z.number(),
  candidateMaxUsers: z.number(),
  motionEnabled: z.boolean(),
  motionDefaultDescription: z.string(),
  motionMaxDescription: z.number(),
  motionMaxSeconders: z.number(),
})

export const load = async ({ parent }) => {
  const { election } = await parent()

  return {
    updateForm: await superValidate(election, zod(updateSchema)),
  }
}

export const actions = {
  update: async ({ request, params }) => {
    const form = await superValidate(request, zod(updateSchema))

    if (!form.valid) {
      return fail(400, { form })
    }
    try {
      await PrismaClient.election.update({
        where: {
          id: params.electionID,
        },
        data: {
          name: form.data.name,
          description: form.data.description,
          start: form.data.start,
          end: form.data.end,
          signUpEnd: form.data.signUpEnd,
          published: form.data.published,
          candidateDefaultDescription: form.data.candidateDefaultDescription,
          candidateMaxDescription: form.data.candidateMaxDescription,
          candidateMaxUsers: form.data.candidateMaxUsers,
          motionDefaultDescription: form.data.motionDefaultDescription,
          motionEnabled: form.data.motionEnabled,
          motionMaxDescription: form.data.motionMaxDescription,
          motionMaxSeconders: form.data.motionMaxSeconders,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return message(form, { type: "error", text: error.message })
      }
      throw error
    }

    if (form.data.image) {
      await storeElectionCoverImage(params.electionID, form.data.image).catch(() => {
        return setError(form, "image", "Failed to upload image")
      })
    }

    return message(form, "Updated")
  },
  delete: async ({ params }) => {
    try {
      deleteElection(params.electionID)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return fail(400, { message: error.message })
      }
    }

    return redirect(303, "/election")
  },
}
