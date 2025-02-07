import { requireCandidateAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { storeCandidateCoverImage, zImage } from "$lib/server/store"

import { fail, redirect } from "@sveltejs/kit"
import { message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const editFormSchema = z.object({
  description: z.string(),
  image: zImage,
  roles: z
    .object({
      id: z.number(),
      name: z.string(),
      checked: z.boolean(),
    })
    .array()
    .refine((roles) => roles.some((role) => role.checked), {
      message: "At least one role must be selected",
    }),
})

export const load = async ({ parent }) => {
  const { candidate, election } = await parent()

  const roles = election.roles.map((role) => {
    return {
      id: role.id,
      name: role.name,
      checked: candidate.roles.some((r) => r.id === role.id),
    }
  })

  const formData = {
    description: candidate.description,
    image: undefined,
    roles,
  }

  return {
    editForm: await superValidate(formData, zod(editFormSchema)),
  }
}

export const actions = {
  update: requireCandidateAdmin({ id: true, election: { select: { id: true } } }, async ({ request, candidate }) => {
    const form = await superValidate(request, zod(editFormSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const roles = form.data.roles.filter((role) => role.checked).map((role) => ({ id: role.id }))

    await PrismaClient.candidate.update({
      where: {
        id: candidate.id,
      },
      data: {
        description: form.data.description,
        roles: {
          set: roles,
        },
      },
    })

    if (form.data.image) {
      await storeCandidateCoverImage(candidate.election.id, candidate.id, form.data.image).catch(() => {
        return fail(500, { message: "Failed to upload image" })
      })
    }

    return message(form, "Updated")
  }),
  leave: requireCandidateAdmin({ id: true, election: { select: { id: true } } }, async ({ userID, candidate }) => {
    await PrismaClient.$transaction(async (tx) => {
      await tx.candidate.update({
        where: { id: candidate.id },
        data: {
          users: {
            disconnect: {
              userID: userID,
            },
          },
        },
      })
      await tx.candidate.deleteMany({
        where: {
          users: {
            none: {},
          },
        },
      })
    })

    return redirect(303, `/election/${candidate.election.id}`)
  }),
}
