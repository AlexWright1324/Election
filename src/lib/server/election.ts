import { join } from "node:path"
import { rm, mkdir } from "node:fs/promises"
import { Prisma } from "$lib/server/db"
import { storePath } from "$lib/server/store"

export const isElectionAdmin = async (electionID: number, userID: string): Promise<boolean> => {
  const election = await Prisma.election.findUnique({
    where: {
      id: electionID,
      admins: {
        some: {
          uniID: userID,
        },
      },
    },
  })
  return election !== null
}

export const isCandidateAdmin = async (candidateID: number, userID: string): Promise<boolean> => {
  const candidate = await Prisma.candidate.findUnique({
    where: {
      id: candidateID,
      users: {
        some: {
          uniID: userID,
        },
      },
    },
  })
  return candidate !== null
}

export const deleteElection = async (electionID: number) => {
  await Prisma.election.delete({
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
