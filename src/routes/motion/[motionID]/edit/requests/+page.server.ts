import { UserCanSecondMotion } from "$lib/client/checks"
import { requireMotionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { fail, message, superValidate, setError } from "sveltekit-superforms"
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
  accept: requireMotionAdmin(
    {
      id: true,
      proposer: { select: { userID: true } },
      seconders: { select: { userID: true } },
      election: { select: { start: true, motionMaxSeconders: true } },
    },
    async ({ request, motion }) => {
      const form = await superValidate(request, zod(requestSchema))

      if (!form.valid) {
        return fail(400, { form })
      }

      if (!UserCanSecondMotion(motion, form.data.userID, new Date())) {
        return setError(form, "", "User can't second this motion")
      }

      await PrismaClient.motion.update({
        where: { id: motion.id, seconderRequests: { some: { userID: form.data.userID } } },
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
    },
  ),
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
