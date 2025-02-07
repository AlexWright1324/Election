import { requireMotionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail, message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const editFormSchema = z.object({
  name: z.string(),
  description: z.string(),
})

export const load = async ({ parent }) => {
  const { motion } = await parent()

  const formData = {
    name: motion.name,
    description: motion.description,
  }

  return {
    editForm: await superValidate(formData, zod(editFormSchema)),
  }
}

export const actions = {
  edit: requireMotionAdmin({ id: true }, async ({ request, motion }) => {
    const form = await superValidate(request, zod(editFormSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.motion.update({
      where: { id: motion.id },
      data: {
        name: form.data.name,
        description: form.data.description,
      },
    })

    return message(form, "Motion updated")
  }),
}
