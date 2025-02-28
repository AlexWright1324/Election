import { UserCanCreateMotion } from "$lib/client/checks.js"
import { emptySchema } from "$lib/client/schema"
import { requireAuth, requireElection } from "$lib/server/auth"
import { canSignup } from "$lib/server/checks"
import { Prisma, PrismaClient } from "$lib/server/db"

import { redirect } from "@sveltejs/kit"
import { fail, superValidate, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { set, z } from "zod"

const candidateSignupSchema = z.object({
  roleID: z.number(),
})

export const load = requireElection(
  {
    id: true,
    name: true,
    description: true,
    imageVersion: true,
    start: true,
    end: true,
    nominationsStart: true,
    nominationsEnd: true,
    membersOnly: true,
    motionEnabled: true,
    roles: {
      select: {
        id: true,
        name: true,
        seatsToFill: true,
        candidates: {
          where: {
            isRON: false,
          },
          select: {
            id: true,
            imageVersion: true,
            users: {
              select: {
                userID: true,
                name: true,
              },
            },
          },
        },
      },
    },
    motions: {
      select: {
        id: true,
        name: true,
        proposer: {
          select: {
            name: true,
          },
        },
        seconders: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        seconders: {
          _count: "desc",
        },
      },
    },
  },
  async ({ election }) => {
    return {
      election,
      candidateSignupForm: await superValidate(zod(candidateSignupSchema)),
      createMotionForm: await superValidate(zod(emptySchema)),
    }
  },
)

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

        try {
          const candidate = await PrismaClient.$transaction(async (tx) => {
            const can = await tx.election.exists({
              id: election.id,
              AND: [canSignup(userID)],
            })

            if (!can) {
              throw Error("You cannot sign up for this election")
            }

            const exists = await tx.candidate.exists({
              role: {
                id: form.data.roleID,
              },
              users: {
                some: {
                  userID,
                },
              },
            })
            if (exists) {
              throw Error("You are already a candidate for this role")
            }

            const candidate = await tx.candidate.create({
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

            return candidate
          })
          return redirect(303, `/candidate/${candidate.id}`)
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Error) {
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
        nominationsStart: true,
        nominationsEnd: true,
        motionEnabled: true,
      },
      async ({ request, election, userID }) => {
        const form = await superValidate(request, zod(emptySchema))
        if (!form.valid) return fail(400, { form })

        if (!UserCanCreateMotion(election, userID, new Date())) {
          return setError(form, "", "You cannot create a motion for this election")
        }

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
