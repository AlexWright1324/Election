import { requireElectionAdmin } from "$lib/server/auth"
import { Prisma, PrismaClient } from "$lib/server/db"
import { deleteElection, enforceRON } from "$lib/server/election"
import { storeElectionCoverImage } from "$lib/server/store"

import { determineSchema, updateSchemaDefault } from "./schema"

import { redirect } from "@sveltejs/kit"
import { message, superValidate, fail, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireElectionAdmin(
  {
    id: true,
    name: true,
    description: true,
    start: true,
    end: true,
    nominationsStart: true,
    nominationsEnd: true,
    membersOnly: true,
    imageVersion: true,
    ronEnabled: true,
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
      election,
      updateForm: await superValidate(election, zod(updateSchemaDefault)),
    }
  },
)

export const actions = {
  update: requireElectionAdmin(
    { id: true, imageVersion: true, start: true, end: true },
    async ({ request, election, cookies, locals }) => {
      const bypass = locals.session?.user.admin ? cookies.get("bypass") === "true" : false
      const { schema } = determineSchema(new Date(), election, bypass)
      const form = await superValidate(request, zod(schema))

      if (!form.valid) {
        return fail(400, { form })
      }

      let imageProcessed: boolean | null = null
      if (form.data.image) {
        await storeElectionCoverImage(election.id, form.data.image)
          .then(() => {
            imageProcessed = true
          })
          .catch(() => {
            imageProcessed = false
          })
      }

      delete form.data.image

      await PrismaClient.$transaction(async (tx) => {
        await tx.election.update({
          where: {
            id: election.id,
          },
          data: {
            ...form.data,
            imageVersion: imageProcessed === true ? election.imageVersion + 1 : Prisma.skip,
          },
        })
        await enforceRON(tx, election.id)
      })

      if (imageProcessed === false) {
        return setError(form, "image", "Failed to store image")
      }
      // TODO: Fix returning without data
      return message(form, "Updated")
    },
  ),
  delete: requireElectionAdmin({ id: true }, async ({ election }) => {
    // TODO: WARNINGS HERE
    deleteElection(election.id)

    return redirect(303, "/election")
  }),
}
