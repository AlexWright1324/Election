import { requireElectionAdmin } from "$lib/server/auth"
import { Prisma, PrismaClient } from "$lib/server/db"
import { deleteElection, enforceRON } from "$lib/server/election"
import { storeElectionCoverImage } from "$lib/server/store"

import { updateSchema } from "./schema"

import { redirect } from "@sveltejs/kit"
import { message, superValidate, fail, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireElectionAdmin(
  {
    candidateDefaultDescription: true,
    candidateMaxDescription: true,
    candidateMaxUsers: true,
  },
  async ({ election }) => {
    return {
      election,
      updateForm: await superValidate(election, zod(updateSchema)),
    }
  },
)

export const actions = {
  update: requireElectionAdmin({ id: true, start: true, end: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(updateSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.election.update({
      where: { id: election.id },
      data: form.data,
    })

    return message(form, "Updated")
  }),
}
