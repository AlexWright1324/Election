import { UserCanJoinCandidate } from "$lib/client/checks.js"
import { emptySchema } from "$lib/client/schema"
import { requireAuth, requireCandidate } from "$lib/server/auth"
import { Prisma, PrismaClient } from "$lib/server/db"

import { fail, message, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireCandidate(
  {
    id: true,
    description: true,
    role: {
      select: {
        name: true,
        election: {
          select: {
            id: true,
          },
        },
      },
    },
    users: {
      select: {
        userID: true,
        name: true,
      },
    },
  },
  async ({ locals, candidate }) => {
    const invited = await PrismaClient.candidate.exists({
      id: candidate.id,
      userInvites: {
        some: {
          userID: locals.session?.user.userID,
        },
      },
    })

    return {
      invited,
      candidate,
      acceptInviteForm: await superValidate(zod(emptySchema)),
    }
  },
)

export const actions = {
  acceptInvite: requireAuth(
    requireCandidate(
      {
        id: true,
        role: {
          select: {
            id: true,
            election: {
              select: {
                nominationsStart: true,
                nominationsEnd: true,
                candidateMaxUsers: true,
              },
            },
          },
        },
        users: {
          select: {
            userID: true,
          },
        },
      },
      async ({ request, userID, candidate }) => {
        const form = await superValidate(request, zod(emptySchema))
        if (!form.valid) return fail(400, { form })

        return await PrismaClient.$transaction(async (tx) => {
          // Check if user is already a candidate for this role
          const exisitingCandidateInRole = await tx.candidate.exists({
            roleID: candidate.role.id,
            users: {
              some: {
                userID,
              },
            },
          })
          if (exisitingCandidateInRole) {
            return setError(form, "", "You are already a candidate for this role")
          }

          if (!UserCanJoinCandidate(candidate, userID, new Date())) {
            return setError(form, "", "You can't join this candidate")
          }

          try {
            await tx.candidate.update({
              where: {
                id: candidate.id,
              },
              data: {
                users: {
                  connect: {
                    userID,
                  },
                },
                userInvites: {
                  disconnect: {
                    userID,
                  },
                },
              },
            })
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              // TODO: This error message is not very helpful
              return setError(form, "", error.message)
            }
            throw error
          }

          return message(form, "You have successfully accepted the invite")
        })
      },
    ),
  ),
}
