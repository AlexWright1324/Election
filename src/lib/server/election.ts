import { PrismaClient } from "$lib/server/db"
import { storePath } from "$lib/server/store"

import { rm, mkdir } from "node:fs/promises"
import { join } from "node:path"

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
      await tx.candidate.upsert({
        where: {
          roleID_isRON: {
            roleID: role.id,
            isRON: true,
          },
        },
        create: {
          description: "",
          isRON: true,
          role: { connect: { id: role.id } },
        },
        update: {}, // No updates needed if RON exists
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
