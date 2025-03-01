import { UserCanEditCandidate } from "$lib/client/checks"
import { zImage } from "$lib/client/schema"
import { requireCandidateAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { storeCandidateCoverImage } from "$lib/server/store"

import { redirect } from "@sveltejs/kit"
import { message, superValidate, setError, fail } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const editFormSchema = z.object({
  description: z.string(),
  image: zImage,
})

export const load = requireCandidateAdmin(
  {
    id: true,
    description: true,
    role: {
      select: {
        election: {
          select: {
            id: true,
          },
        },
      },
    },
  },
  async ({ candidate }) => {
    return {
      candidate,
      editForm: await superValidate(candidate, zod(editFormSchema)),
    }
  },
)

export const actions = {
  update: requireCandidateAdmin(
    {
      id: true,
      users: { select: { userID: true } },
      role: { select: { election: { select: { id: true, start: true, candidateMaxDescription: true } } } },
    },
    async ({ request, candidate, locals }) => {
      const form = await superValidate(request, zod(editFormSchema))

      if (!form.valid) {
        return fail(400, { form })
      }

      const canEdit = UserCanEditCandidate(candidate, locals.session?.user, new Date())
      if (canEdit.allow === undefined) {
        return setError(form, "", canEdit.error)
      }

      if (form.data.description.length > candidate.role.election.candidateMaxDescription) {
        const diff = form.data.description.length - candidate.role.election.candidateMaxDescription
        return setError(form, "description", `Description is ${diff} characters longer than allowed`)
      }

      await PrismaClient.candidate.update({
        where: {
          id: candidate.id,
        },
        data: {
          description: form.data.description,
        },
      })

      if (form.data.image) {
        await storeCandidateCoverImage(candidate.role.election.id, candidate.id, form.data.image).catch(() => {
          return fail(500, { message: "Failed to upload image" })
        })
      }

      return message(form, "Updated")
    },
  ),
  leave: requireCandidateAdmin(
    {
      id: true,
      users: { select: { userID: true } },
      role: { select: { election: { select: { id: true, start: true } } } },
    },
    async ({ candidate, userID }) => {
      if (!UserCanEditCandidate(candidate, userID, new Date())) {
        return fail(400, { message: "You can't leave this candidate" })
      }

      const candidateData = await PrismaClient.candidate.update({
        where: { id: candidate.id },
        data: {
          users: {
            disconnect: {
              userID: userID,
            },
          },
        },
        select: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      })

      if (candidateData._count.users === 0) {
        await PrismaClient.candidate.delete({
          where: { id: candidate.id },
        })
      }

      return redirect(303, `/election/${candidate.role.election.id}`)
    },
  ),
}
