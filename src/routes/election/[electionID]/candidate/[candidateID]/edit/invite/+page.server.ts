import type { PageServerLoad } from "./$types"

import { PrismaClient } from "$lib/server/db"

import { setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { fail } from "@sveltejs/kit"
import { z } from "zod"
import { isCandidateAdmin } from "$lib/server/election"

const inviteFormSchema = z.object({
  userID: z.string().nonempty("University ID is required"),
})

const uninviteFormSchema = z.object({
  id: z.number(),
})

export const load: PageServerLoad = async ({ parent }) => {
  const { candidate } = await parent()

  const currentInvites = await PrismaClient.candidateInvite.findMany({
    where: {
      candidateID: candidate.id,
    },
    select: {
      id: true,
      user: {
        select: {
          userID: true,
          name: true,
        },
      },
    },
  })

  return {
    inviteForm: await superValidate(zod(inviteFormSchema)),
    uninviteForm: await superValidate(zod(uninviteFormSchema)),
    currentInvites,
  }
}

export const actions = {
  invite: async ({ locals, params, request }) => {
    const session = await locals.auth()
    const form = await superValidate(request, zod(inviteFormSchema))

    if (!session?.user?.userID || !form.valid) {
      return fail(400, { form })
    }

    const electionID = Number(params.electionID)
    const candidateID = Number(params.candidateID)

    const admin = await isCandidateAdmin(candidateID, session.user.userID)

    if (!admin) {
      return fail(403, { message: "You are not an admin" })
    }

    return await PrismaClient.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          userID: form.data.userID,
        },
      })

      if (!user) {
        return setError(form, "userID", "User does not exist")
      }

      const userIsMember = await tx.candidate.exists({
        id: candidateID,
        users: {
          some: {
            userID: form.data.userID,
          },
        },
      })

      if (userIsMember) {
        return setError(form, "userID", "User is already a member")
      }

      await tx.candidateInvite.create({
        data: {
          candidate: {
            connect: {
              id: candidateID,
            },
          },
          user: {
            connect: {
              userID: form.data.userID,
            },
          },
        },
      })
    })
  },
  uninvite: async ({ locals, params, request }) => {
    const session = await locals.auth()
    const form = await superValidate(request, zod(uninviteFormSchema))

    if (!session?.user?.userID || !form.valid) {
      return fail(400, { form })
    }

    const electionID = Number(params.electionID)
    const candidateID = Number(params.candidateID)

    const admin = await isCandidateAdmin(candidateID, session.user.userID)

    if (!admin) {
      return fail(403, { message: "You are not an admin" })
    }

    return await PrismaClient.$transaction(async (tx) => {
      await tx.candidateInvite.delete({
        where: {
          id: form.data.id,
        },
      })
    })
  }
}
