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
    id: true,
    name: true,
    description: true,
    start: true,
    end: true,
    nominationsStart: true,
    nominationsEnd: true,
    published: true,
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
      updateForm: await superValidate(election, zod(updateSchema)),
    }
  },
)

export const actions = {
  update: requireElectionAdmin(
    { id: true, imageVersion: true, start: true, end: true },
    async ({ request, election }) => {
      const form = await superValidate(request, zod(updateSchema), {
        strict: true,
      })

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

      // Only allow changes to certain field when election is ongoing
      const initialData = {
        name: form.data.name,
        description: form.data.description,
        candidateDefaultDescription: form.data.candidateDefaultDescription,
        candidateMaxDescription: form.data.candidateMaxDescription,
        motionMaxDescription: form.data.motionMaxDescription,
        motionDefaultDescription: form.data.motionDefaultDescription,
        motionMaxSeconders: form.data.motionMaxSeconders,
      }

      // TODO: Decide if election is locked after voting starts (disregard ending)
      let data: Prisma.ElectionUpdateInput = initialData
      const addData = () => {
        data = {
          ...initialData,
          start: form.data.start,
          end: form.data.end,
          nominationsStart: form.data.nominationsStart,
          nominationsEnd: form.data.nominationsEnd,
          membersOnly: form.data.membersOnly,
          ronEnabled: form.data.ronEnabled,
          candidateMaxUsers: form.data.candidateMaxUsers,
          motionEnabled: form.data.motionEnabled,
          published: form.data.published,
        } satisfies typeof form.data // Check all fields are present
      }
      if (election.start && election.end) {
        if (election.start < new Date() && election.end > new Date()) {
          addData()
        }
      } else {
        addData()
      }

      await PrismaClient.$transaction(async (tx) => {
        await tx.election.update({
          where: {
            id: election.id,
          },
          data,
        })
        await enforceRON(tx, election.id)
      })

      if (imageProcessed === false) {
        return setError(form, "image", "Failed to store image")
      }

      return message(form, "Updated")
    },
  ),
  delete: requireElectionAdmin({ id: true }, async ({ election }) => {
    deleteElection(election.id)

    return redirect(303, "/election")
  }),
}
