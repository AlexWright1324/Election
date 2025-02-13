import { requireElectionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { deleteElection } from "$lib/server/election"
import { storeElectionCoverImage } from "$lib/server/store"

import { updateSchema } from "./schema"
import { redirect } from "@sveltejs/kit"
import { message, superValidate, fail, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireElectionAdmin(
  {
    name: true,
    description: true,
    start: true,
    end: true,
    signUpEnd: true,
    published: true,
    candidateDefaultDescription: true,
    candidateMaxDescription: true,
    candidateMaxUsers: true,
    motionEnabled: true,
    motionDefaultDescription: true,
    motionMaxDescription: true,
    motionMaxSeconders: true,
  },
  async ({ election }) => {
    return {
      updateForm: await superValidate(election, zod(updateSchema), {
        errors: true,
      }),
    }
  },
)

export const actions = {
  update: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(updateSchema), {
      strict: true,
    })

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

    if (form.data.image) {
      await storeElectionCoverImage(election.id, form.data.image).catch(() => {
        return setError(form, "image", "Failed to store image")
      })
    }

    return message(form, "Updated")
  }),
  delete: requireElectionAdmin({ id: true }, async ({ election }) => {
    deleteElection(election.id)

    return redirect(303, "/election")
  }),
}
