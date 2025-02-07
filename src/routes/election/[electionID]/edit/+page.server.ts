import { redirect } from "@sveltejs/kit"

import { PrismaClient } from "$lib/server/db"
import { deleteElection } from "$lib/server/election"
import { storeElectionCoverImage, zImage } from "$lib/server/store"

import { message, superValidate, fail } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"
import { requireElectionAdmin } from "$lib/server/auth"

const updateSchema = z.object({
  name: z.string(),
  description: z.string(),
  start: z.date().nullable(),
  end: z.date().nullable(),
  candidateStart: z.date().nullable(),
  candidateEnd: z.date().nullable(),
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
  update: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(updateSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.election.update({
      where: {
        id: election.id,
      },
      data: {
        name: form.data.name,
        description: form.data.description,
        start: form.data.start,
        end: form.data.end,
        candidateStart: form.data.candidateStart,
        candidateEnd: form.data.candidateEnd,
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

    if (form.data.image) {
      await storeElectionCoverImage(election.id, form.data.image).catch(() => {
        return fail(500, { message: "Failed to upload image" })
      })
    }

    return message(form, "Updated")
  }),
  delete: requireElectionAdmin({ id: true }, async ({ election }) => {
    deleteElection(election.id)

    return redirect(303, "/election")
  }),
}
