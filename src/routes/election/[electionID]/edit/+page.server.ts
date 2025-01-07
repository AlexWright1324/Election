import { fail, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

import { uploadImage } from "$lib/client/files"
import { Prisma } from "$lib/server/db"
import { deleteElection, isElectionAdmin } from "$lib/server/election"

import { message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string(),
  description: z.string(),
  start: z.date().nullable(),
  end: z.date().nullable(),
  candidateStart: z.date().nullable(),
  candidateEnd: z.date().nullable(),
  published: z.boolean(),
  image: z
    .instanceof(File, { message: "Please upload an image" })
    .nullable()
    .refine((f) => f === null || f.size < 1024 * 1024 * 5, {
      message: "Image size must be less than 5MB",
    }),
})

export const load: PageServerLoad = async ({ parent }) => {
  const { election } = await parent()

  return {
    updateForm: await superValidate(election, zod(updateSchema)),
  }
}

export const actions = {
  update: async ({ request, locals, params }) => {
    const session = await locals.auth()
    const form = await superValidate(request, zod(updateSchema))

    if (!session?.user?.uniID || !form.valid) {
      return fail(400, { form })
    }

    const electionID = Number(params.electionID)

    const admin = await isElectionAdmin(electionID, session.user.uniID)
    if (!admin) {
      return fail(403, { message: "You are not an admin" })
    }

    await Prisma.election.update({
      where: {
        id: electionID,
      },
      data: {
        name: form.data.name,
        description: form.data.description,
        start: form.data.start,
        end: form.data.end,
        candidateStart: form.data.candidateStart,
        candidateEnd: form.data.candidateEnd,
        published: form.data.published,
      },
    })

    if (form.data.image !== null) {
      await uploadImage(form.data.image, ["elections", electionID.toString(), "cover.jpg"]).catch(() => {
        return fail(500, { message: "Failed to upload image" })
      })
    }

    return message(form, "Updated")
  },
  delete: async ({ locals, params }) => {
    const session = await locals.auth()

    if (!session?.user?.uniID) {
      return fail(400)
    }

    const electionID = Number(params.electionID)

    if (!(await isElectionAdmin(electionID, session.user.uniID))) {
      return fail(403, { message: "You are not an admin" })
    }

    deleteElection(electionID)

    return redirect(303, "/election")
  },
}
