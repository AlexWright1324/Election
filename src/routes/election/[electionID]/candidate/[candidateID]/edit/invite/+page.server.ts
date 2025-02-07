import { requireCandidateAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail } from "@sveltejs/kit"
import { message, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const inviteFormSchema = z.object({
  userID: z.string().nonempty("User ID is required"),
})

export const load = async () => {
  return {
    inviteForm: await superValidate(zod(inviteFormSchema)),
  }
}

export const actions = {
  invite: requireCandidateAdmin({ id: true }, async ({ request, candidate }) => {
    const form = await superValidate(request, zod(inviteFormSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const invitedID = form.data.userID.replace(/^u/, "")

    await PrismaClient.candidate
      .update({
        where: {
          id: candidate.id,
          users: {
            none: {
              userID: form.data.userID,
            },
          },
        },
        data: {
          userInvites: {
            connect: {
              userID: invitedID,
            },
          },
        },
      })
      .catch((error) => {
        switch (error.code) {
          case "P2025":
            return setError(form, "userID", "User doesn't exist")
          case "P2016":
            return setError(form, "userID", "User is already a candidate")
          default:
            return setError(form, `${error.code}`)
        }
      })

    return message(form, "User invited")
  }),
  uninvite: requireCandidateAdmin({ id: true }, async ({ request, candidate }) => {
    const form = await superValidate(request, zod(inviteFormSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.candidate.update({
      where: {
        id: candidate.id,
      },
      data: {
        userInvites: {
          disconnect: {
            userID: form.data.userID,
          },
        },
      },
    })

    return message(form, "User uninvited")
  }),
}
