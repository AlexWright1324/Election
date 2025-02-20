import { requireAuth, requireElection } from "$lib/server/auth"
import { canVote } from "$lib/server/checks"
import { Prisma, PrismaClient } from "$lib/server/db"

import { clientVoteSchema, serverVoteSchema } from "./schema"

import { error } from "@sveltejs/kit"
import { superValidate, fail, setError, message } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireAuth(
  requireElection(
    {
      id: true,
      roles: {
        select: {
          id: true,
          name: true,
          candidates: { select: { id: true, users: { select: { name: true } }, isRON: true } },
        },
      },
      motions: { select: { id: true, name: true } },
    },
    async ({ userID, election }) => {
      const canvote = await PrismaClient.election.exists({
        id: election.id,
        AND: canVote(userID),
      })

      if (!canvote) return error(403, "Not allowed to vote")

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
  ),
)

export const actions = {
  vote: requireAuth(
    requireElection(
      {
        id: true,
        roles: { select: { id: true, candidates: { select: { id: true } } } },
        motions: { select: { id: true } },
      },
      async ({ request, userID, election }) => {
        const form = await superValidate(request, zod(serverVoteSchema))
        if (!form.valid) return fail(400, { form })

        const userCanVote = await PrismaClient.election.exists({
          id: election.id,
          AND: canVote(userID),
        })

        if (!userCanVote) return setError(form, "", "Not allowed to vote")

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

        await PrismaClient.election.update({
          where: { id: election.id },
          data: {
            voters: {
              create: {
                userID,
              },
            },
            ballots: {
              create: {
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
            },
          },
        })

        return message(form, "Vote submitted")
      },
    ),
  ),
}
