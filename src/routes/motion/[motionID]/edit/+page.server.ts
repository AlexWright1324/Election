import { route } from "$lib/ROUTES"
import { UserCanEditMotion } from "$lib/client/checks"
import { requireMotionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { editFormSchema } from "./schema"

import { redirect } from "@sveltejs/kit"
import { fail, message, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireMotionAdmin({ name: true, description: true }, async ({ motion }) => {
  return {
    editForm: await superValidate(motion, zod(editFormSchema)),
  }
})

export const actions = {
  edit: requireMotionAdmin(
    {
      id: true,
      proposer: { select: { userID: true } },
      election: { select: { id: true, start: true, motionMaxDescription: true } },
    },
    async ({ request, motion, locals }) => {
      const form = await superValidate(request, zod(editFormSchema))

      if (!form.valid) return fail(400, { form })

      if (form.data.description.length > motion.election.motionMaxDescription) {
        const overBy = form.data.description.length - motion.election.motionMaxDescription
        return setError(form, "description", `Description is longer than allowed by ${overBy} characters`)
      }

      const canEdit = UserCanEditMotion(motion, locals.session?.user, new Date())
      if (canEdit.error) {
        return setError(form, "", canEdit.error)
      }

      await PrismaClient.motion.update({
        where: {
          id: motion.id,
        },
        data: {
          name: form.data.name,
          description: form.data.description,
        },
      })

      return message(form, "Updated")
    },
  ),
  delete: requireMotionAdmin(
    { id: true, proposer: { select: { userID: true } }, election: { select: { id: true, start: true } } },
    async ({ motion, locals }) => {
      const canEdit = UserCanEditMotion(motion, locals.session?.user, new Date())
      if (canEdit.error) {
        return fail(403, { message: canEdit.error })
      }
      await PrismaClient.motion.delete({
        where: {
          id: motion.id,
        },
      })

      return redirect(303, route("/election/[electionID]", { electionID: motion.election.id }))
    },
  ),
}
