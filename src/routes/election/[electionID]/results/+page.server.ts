import { seperateJoin } from "$lib/client/separate"
import { requireElectionAdmin } from "$lib/server/auth"

import { MotionVoteType } from "@prisma/client"
import { stv } from "stv/src/stv"

export const load = requireElectionAdmin(
  {
    roles: {
      select: {
        id: true,
        name: true,
        seatsToFill: true,
        candidates: { select: { id: true, isRON: true, users: { select: { name: true } } } },
      },
    },
    motions: {
      select: {
        id: true,
        name: true,
        votes: {
          select: {
            vote: true,
          },
        },
      },
    },
    ballots: {
      select: {
        candidateVotes: {
          select: {
            position: true,
            candidate: {
              select: {
                id: true,
                role: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    },
  },
  async ({ election }) => {
    const getCandidateName = (candidateID: string) => {
      const candidate = election.roles.flatMap((role) => role.candidates).find((c) => c.id === candidateID)
      if (!candidate) return "Unknown"
      return candidate.isRON ? "Re-Open Nominations" : seperateJoin(candidate.users.map((u) => u.name))
    }

    const roleResults = election.roles.map((role) => {
      const votes = election.ballots.map((ballot) => ({
        weight: 1,
        preferences: ballot.candidateVotes
          .filter((vote) => vote.candidate.role.id === role.id)
          .sort((a, b) => a.position - b.position)
          .map((vote) => vote.candidate.id),
      }))

      const stvResult = stv({
        seatsToFill: role.seatsToFill,
        candidates: role.candidates.map((candidate) => candidate.id),
        votes,
      })

      const stvWinners = stvResult.winners.map((winner) => ({
        id: winner,
        name: getCandidateName(winner),
      }))

      const stvRounds = stvResult.rounds
        // Sort rounds by round number - this is probably unnecessary as the rounds are already sorted
        // but it's good to be explicit :)
        .toSorted((a, b) => (a.number < b.number ? -1 : a.number > b.number ? 1 : 0))
        .map((round) => {
          // Return table of candidate names, (winner/eliminated) and their tally

          const candidates: {
            [id: string]: {
              name: string
              status?: "winner" | "eliminated"
              tally?: number
            }
          } = {}

          Object.entries(round.runningTally).forEach(([id, tally]) => {
            candidates[id] = {
              name: getCandidateName(id),
              tally,
            }
          })

          round.winners.forEach((id) => {
            if (candidates[id]) {
              candidates[id].status = "winner"
              return
            }

            candidates[id] = {
              name: getCandidateName(id),
              status: "winner",
            }
          })

          round.eliminated.forEach((id) => {
            if (candidates[id]) {
              candidates[id].status = "eliminated"
              return
            }

            candidates[id] = {
              name: getCandidateName(id),
              status: "eliminated",
            }
          })

          return {
            candidates: Object.entries(candidates).map(([id, candidate]) => ({
              id,
              ...candidate,
            })),
          }
        })

      return {
        name: role.name,
        seatsToFill: role.seatsToFill,
        droopQuota: stvResult.winQuota,
        winners: stvWinners,
        rounds: stvRounds,
      }
    })

    const motionResults = election.motions.map((motion) => ({
      name: motion.name,
      results: motion.votes.reduce(
        (acc, vote) => {
          if (vote.vote === MotionVoteType.FOR) acc.for++
          if (vote.vote === MotionVoteType.AGAINST) acc.against++
          if (vote.vote === MotionVoteType.ABSTAIN) acc.abstain++
          return acc
        },
        { for: 0, against: 0, abstain: 0 },
      ),
    }))

    const results = {
      roles: roleResults,
      motions: motionResults,
    }

    return {
      numVotes: election.ballots.length,
      results,
    }
  },
)
