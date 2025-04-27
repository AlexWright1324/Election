import { UserCanCreateCandidate, UserCanCreateMotion } from "$lib/client/checks"
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
    resultsPosted: true,
    roles: {
      select: {
        id: true,
        name: true,
        seatsToFill: true,
        result: true,
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
        result: true,
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
  async ({ election, locals }) => {
    const electionData = {
      ...election,
      hasVoted: locals.session
        ? await PrismaClient.voter.exists({
            election: {
              id: election.id,
            },
            user: {
              userID: locals.session?.user.userID ?? "",
            },
          })
        : false,
      isMember: locals.session
        ? await PrismaClient.election.exists({
            id: election.id,
            members: {
              some: {
                userID: locals.session?.user.userID ?? "",
              },
            },
          })
        : false,
    }

    return {
      election: electionData,
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
        nominationsStart: true,
        nominationsEnd: true,
      },
      async ({ request, election, userID, locals }) => {
        const form = await superValidate(request, zod(candidateSignupSchema))
        if (!form.valid) return fail(400, { form })

        try {
          const candidate = await PrismaClient.$transaction(async (tx) => {
            const role = await tx.role.findUnique({
              where: {
                id: form.data.roleID,
              },
              select: {
                candidates: {
                  select: {
                    users: {
                      select: {
                        userID: true,
                      },
                    },
                  },
                },
              },
            })
            if (!role) {
              throw new Error("Role not found")
            }
            const canSignup = UserCanCreateCandidate(election, role, locals.session?.user, new Date())

            if (canSignup.allow === undefined) {
              throw new Error(canSignup.error)
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

        const canCreate = UserCanCreateMotion(election, userID, new Date())
        if (canCreate.allow === undefined) {
          return setError(form, "", canCreate.error)
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
