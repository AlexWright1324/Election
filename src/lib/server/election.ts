import { seperateJoin } from "$lib/client/separate"
import { PrismaClient } from "$lib/server/db"
import { storePath } from "$lib/server/store"

import { MotionVoteType } from "@prisma/client"
import { rm, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { stv } from "stv/src/stv"

export const deleteElection = async (electionID: string) => {
  await PrismaClient.election.delete({
    where: {
      id: electionID,
    },
  })

  const path = join(storePath, "elections", electionID.toString())
  await rm(path, { recursive: true, force: true })
}

export const createElection = async (id: string) => {
  const path = join(storePath, "elections", id, "candidates")
  await mkdir(path, { recursive: true })
}

export const enforceRON = async (
  tx: Parameters<Parameters<typeof PrismaClient.$transaction>[0]>[0],
  electionID: string,
) => {
  const election = await tx.election.findUnique({
    where: { id: electionID },
    select: { roles: { select: { id: true } }, ronEnabled: true },
  })

  if (!election) {
    throw new Error("Election not found")
  }

  if (election.ronEnabled) {
    // Add RON to all roles that don't have it
    for (const role of election.roles) {
      const ron = await tx.role.exists({
        id: role.id,
        candidates: {
          some: {
            isRON: true,
          },
        },
      })
      if (ron) continue
      await tx.candidate.create({
        data: {
          description: "",
          isRON: true,
          role: { connect: { id: role.id } },
        },
      })
    }
  } else {
    // Remove RON from all roles
    await tx.candidate.deleteMany({
      where: {
        role: { electionID },
        isRON: true,
      },
    })
  }
}

export const generateResults = async (electionID: string) => {
  const election = await PrismaClient.election.findUnique({
    where: { id: electionID },
    select: {
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
  })

  if (!election) {
    throw new Error("Election not found")
  }

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
      id: role.id,
      name: role.name,
      seatsToFill: role.seatsToFill,
      droopQuota: stvResult.winQuota,
      winners: stvWinners,
      rounds: stvRounds,
    }
  })

  const motionResults = election.motions.map((motion) => ({
    id: motion.id,
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
}
