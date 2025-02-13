import { emptySchema } from "$lib/client/schema"
import { requireAuth, requireElection } from "$lib/server/auth"
import { Prisma, PrismaClient } from "$lib/server/db"

import { redirect } from "@sveltejs/kit"
import { fail, superValidate, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const candidateSignupSchema = z.object({
  roleID: z.number(),
})

export const load = async () => {
  return {
    candidateSignupForm: await superValidate(zod(candidateSignupSchema)),
    createMotionForm: await superValidate(zod(emptySchema)),
  }
}

export const actions = {
  candidateSignup: requireAuth(
    requireElection(
      {
        id: true,
        candidateDefaultDescription: true,
      },
      async ({ request, election, userID }) => {
        const form = await superValidate(request, zod(candidateSignupSchema))
        if (!form.valid) return fail(400, { form })

        // TODO: verify timing
        // TODO: verify user is not already a candidate for this role

        try {
          const candidate = await PrismaClient.candidate.create({
            select: {
              id: true,
            },
            data: {
              description: election.candidateDefaultDescription,
              role: {
                connect: {
                  id: form.data.roleID,
                },
              },
              users: {
                connect: {
                  userID,
                },
              },
            },
          })

          return redirect(303, `/candidate/${candidate.id}`)
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return setError(form, "", error.message)
          }
          throw error
        }
      },
    ),
  ),
  createMotion: requireAuth(
    requireElection(
      {
        id: true,
        motionDefaultDescription: true,
      },
      async ({ request, election, userID }) => {
        const form = await superValidate(request, zod(emptySchema))
        if (!form.valid) return fail(400, { form })

        try {
          const motion = await PrismaClient.motion.create({
            select: {
              id: true,
            },
            data: {
              description: election.motionDefaultDescription,
              election: {
                connect: {
                  id: election.id,
                },
              },
              proposer: {
                connect: {
                  userID,
                },
              },
            },
          })

          return redirect(303, `/motion/${motion.id}`)
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return setError(form, "", error.message)
          }
          throw error
        }
      },
    ),
  ),
}
