import { requireMotionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { editFormSchema } from "./schema"
import { fail, message, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireMotionAdmin({ name: true, description: true }, async ({ motion }) => {
  return {
    editForm: await superValidate(motion, zod(editFormSchema)),
  }
})

export const actions = {
  edit: requireMotionAdmin(
    { id: true, election: { select: { id: true, motionMaxDescription: true } } },
    async ({ request, motion }) => {
      const form = await superValidate(request, zod(editFormSchema))

      if (!form.valid) {
        return fail(400, { form })
      }

      if (form.data.description.length > motion.election.motionMaxDescription) {
        const overBy = form.data.description.length - motion.election.motionMaxDescription
        return setError(form, "description", `Description is longer than allowed by ${overBy} characters`)
      }

      await PrismaClient.motion.update({
        where: {
          id: motion.id,
        },
        data: {
          description: form.data.description,
        },
      })

      return message(form, "Updated")
    },
  ),
}
