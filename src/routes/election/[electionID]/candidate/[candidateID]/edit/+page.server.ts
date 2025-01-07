import type { PageServerLoad } from "./$types"

import { Prisma } from "$lib/server/db"
import { isCandidateAdmin } from "$lib/server/election"

import { message, superValidate, fail } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"
import { uploadImage } from "$lib/client/files"

const editFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z
    .instanceof(File, { message: "Please upload an image" })
    .nullable()
    .refine((f) => f === null || f.size < 1024 * 1024 * 5, {
      message: "Image size must be less than 5MB",
    }),
})

export const load: PageServerLoad = async ({ parent }) => {
  const { candidate, candidateAdmin } = await parent()

  if (!candidateAdmin) {
    return fail(403, { message: "You are not authorized to edit this candidate" })
  }

  return {
    editForm: await superValidate(candidate, zod(editFormSchema)),
  }
}

export const actions = {
  update: async ({ locals, params, request }) => {
    const session = await locals.auth()
    const form = await superValidate(request, zod(editFormSchema))

    if (!session?.user?.uniID || !form.valid) {
      return fail(400, { form })
    }

    const electionID = Number(params.electionID)
    const candidateID = Number(params.candidateID)

    const admin = await isCandidateAdmin(candidateID, session.user.uniID)

    if (!admin) {
      return fail(403, { message: "You are not an admin" })
    }

    await Prisma.candidate.update({
      where: {
        id: candidateID,
      },
      data: {
        name: form.data.name,
        description: form.data.description,
      },
    })

    if (form.data.image) {
      await uploadImage(form.data.image, ["elections", electionID.toString(), "candidates", candidateID.toString(), "cover.jpg"]).catch(
        () => {
          return fail(500, { message: "Failed to upload image" })
        }
      )
    }

    return message(form, "Updated")
  },
}
