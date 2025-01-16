import type { PageServerLoad } from "./$types"

import { PrismaClient } from "$lib/server/db"
import { isCandidateAdmin } from "$lib/server/election"
import { storeCandidateCoverImage, zImage } from "$lib/server/store"

import { message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { fail, redirect } from "@sveltejs/kit"
import { z } from "zod"

const editFormSchema = z.object({
  name: z.string(),
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

export const load: PageServerLoad = async ({ parent }) => {
  const { candidate, election } = await parent()

  const roles = election.roles.map((role) => {
    return {
      id: role.id,
      name: role.name,
      checked: candidate.roles.some((r) => r.id === role.id),
    }
  })

  const formData = {
    name: candidate.name,
    description: candidate.description,
    image: null,
    roles,
  }

  return {
    editForm: await superValidate(formData, zod(editFormSchema)),
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

    const roles = form.data.roles.filter((role) => role.checked).map((role) => ({ id: role.id }))

    await PrismaClient.candidate.update({
      where: {
        id: candidateID,
      },
      data: {
        name: form.data.name,
        description: form.data.description,
        roles: {
          set: roles,
        },
      },
    })

    if (form.data.image) {
      await storeCandidateCoverImage(electionID, candidateID, form.data.image).catch(() => {
        return fail(500, { message: "Failed to upload image" })
      })
    }

    return message(form, "Updated")
  },
  leave: async ({ locals, params }) => {
    const session = await locals.auth()

    if (!session?.user.uniID) {
      return fail(403, { message: "You are not logged in" })
    }

    const electionID = Number(params.electionID)
    const candidateID = Number(params.candidateID)

    await PrismaClient.$transaction(async (tx) => {
      await tx.candidate.update({
        where: { id: candidateID },
        data: {
          users: {
            disconnect: {
              uniID: session.user.uniID,
            },
          },
        },
      })
      await tx.candidate.deleteMany({
        where: {
          users: {
            none: {}
          }
        }
      })
    })

    return redirect(303, `/election/${electionID}`)
  },
}
