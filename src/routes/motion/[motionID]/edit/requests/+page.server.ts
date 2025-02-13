import { requireMotionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail, message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const requestSchema = z.object({
  userID: z.string(),
})

export const load = requireMotionAdmin(
  {
    seconderRequests: {
      select: {
        name: true,
        userID: true,
      },
    },
  },
  async ({ motion }) => {
    return {
      motion,
      requestForm: await superValidate(zod(requestSchema)),
    }
  },
)

export const actions = {
  accept: requireMotionAdmin({ id: true }, async ({ request, motion }) => {
    const form = await superValidate(request, zod(requestSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.motion.update({
      where: { id: motion.id },
      data: {
        seconderRequests: {
          disconnect: {
            userID: form.data.userID,
          },
        },
        seconders: {
          connect: {
            userID: form.data.userID,
          },
        },
      },
    })

    return message(form, "Request accepted")
  }),
  reject: requireMotionAdmin({ id: true }, async ({ request, motion }) => {
    const form = await superValidate(request, zod(requestSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.motion.update({
      where: { id: motion.id },
      data: {
        seconderRequests: {
          disconnect: {
            userID: form.data.userID,
          },
        },
      },
    })

    return message(form, "Request rejected")
  }),
}
