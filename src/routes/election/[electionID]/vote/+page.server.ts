import { route } from "$lib/ROUTES"
import { UserCanVote } from "$lib/client/checks"
import { requireAuth, requireElection } from "$lib/server/auth"
import { Prisma, PrismaClient } from "$lib/server/db"

import { clientVoteSchema, serverVoteSchema } from "./schema"

import { error, redirect } from "@sveltejs/kit"
import { superValidate, fail, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireElection(
  {
    id: true,
    start: true,
    end: true,
    membersOnly: true,
    roles: {
      select: {
        id: true,
        name: true,
        candidates: { select: { id: true, users: { select: { name: true } }, isRON: true } },
      },
    },
    motions: {
      select: { id: true, name: true },
      where: {
        NOT: {
          seconders: {
            none: {},
          },
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
              userID: locals.session?.user.userID,
            },
          })
        : false,
      isMember: locals.session
        ? await PrismaClient.election.exists({
            id: election.id,
            members: {
              some: {
                userID: locals.session?.user.userID,
              },
            },
          })
        : false,
    }
    const canVote = UserCanVote(electionData, locals.session?.user, new Date())
    if (!canVote.allow) {
      return error(403, canVote.error)
    }

    const roles = election.roles.map((role) => ({
      id: role.id,
      candidates: [],
    }))

    const motions = election.motions.map((motion) => ({
      id: motion.id,
    }))

    return {
      election,
      voteForm: await superValidate({ roles, motions }, zod(clientVoteSchema)),
    }
  },
)

export const actions = {
  vote: requireElection(
    {
      id: true,
      start: true,
      end: true,
      membersOnly: true,
      roles: { select: { id: true, candidates: { select: { id: true } } } },
      motions: {
        select: { id: true },
        where: {
          NOT: {
            seconders: {
              none: {},
            },
          },
        },
      },
    },
    async ({ request, election, locals }) => {
      const form = await superValidate(request, zod(serverVoteSchema))
      if (!form.valid) return fail(400, { form })

      const electionData = {
        ...election,
        hasVoted: locals.session
          ? await PrismaClient.voter.exists({
              election: {
                id: election.id,
              },
              user: {
                userID: locals.session?.user.userID,
              },
            })
          : false,
        isMember: locals.session
          ? await PrismaClient.election.exists({
              id: election.id,
              members: {
                some: {
                  userID: locals.session?.user.userID,
                },
              },
            })
          : false,
      }
      const canVote = UserCanVote(electionData, locals.session?.user, new Date())
      if (!canVote.allow) {
        return error(403, canVote.error)
      }

      if (!canVote.allow) return setError(form, "", canVote.error)

      // Ensure all roles and motions ids are equal to the ones in the election with no extra or missing
      const roleIDs = election.roles.map((role) => role.id)
      const formRoleIDs = form.data.roles.map((role) => role.id)
      const motionIDs = election.motions.map((motion) => motion.id)
      const formMotionIDs = form.data.motions.map((motion) => motion.id)

      if (
        roleIDs.length !== formRoleIDs.length ||
        motionIDs.length !== formMotionIDs.length ||
        !roleIDs.every((id) => formRoleIDs.includes(id)) ||
        !motionIDs.every((id) => formMotionIDs.includes(id))
      ) {
        return setError(form, "", "All roles and motions must be present to vote")
      }

      const candidateVotes = form.data.roles.flatMap((role) =>
        role.candidates.map((candidate, index) => ({
          candidateID: candidate?.id,
          position: index,
        })),
      ) as Prisma.CandidateVoteCreateManyBallotInput[]

      const motionVotes = form.data.motions.map((vote) => ({
        motionID: vote.id,
        vote: vote.vote,
      })) as Prisma.MotionVoteCreateManyBallotInput[]

      const ballot = await PrismaClient.$transaction(async (tx) => {
        await tx.voter.create({
          data: {
            user: {
              connect: {
                userID: locals.session?.user.userID,
              },
            },
            election: {
              connect: {
                id: election.id,
              },
            },
          },
        })

        return await tx.ballot.create({
          select: {
            signature: true,
          },
          data: {
            election: {
              connect: {
                id: election.id,
              },
            },
            candidateVotes: {
              createMany: {
                data: candidateVotes,
              } as Prisma.CandidateVoteCreateManyBallotInputEnvelope,
            },
            motionVotes: {
              createMany: {
                data: motionVotes,
              } as Prisma.MotionVoteCreateManyBallotInputEnvelope,
            },
          },
        })
      })

      return redirect(
        303,
        route("/election/[electionID]/vote/confirm", {
          electionID: election.id,
          signature: ballot.signature,
        }),
      )
    },
  ),
}
