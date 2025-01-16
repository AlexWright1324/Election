import { PrismaClient } from "$lib/server/db"
import { isElectionAdmin } from "$lib/server/election"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { session } = await parent()

  const id = Number(params.electionID)

  const electionAdmin = session?.user?.uniID ? await isElectionAdmin(id, session.user.uniID) : false

  const election = await PrismaClient.election.findUnique({
    where: {
      id,
      published: electionAdmin ? undefined : true,
    },
    include: {
      roles: {
        select: {
          id: true,
          name: true,
          candidates: {
            select: {
              id: true,
              name: true,
              users: {
                select: {
                  name: true,
                },
                where: {
                  uniID: session?.user?.uniID,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!election) {
    error(404, "Election not found")
  }

  const candidateInvites = await PrismaClient.candidateInvite.findMany({
    where: {
      candidate: {
        electionID: id,
      },
      uniID: session?.user?.uniID,
    },
    include: {
      candidate: {
        select: {
          name: true,
        },
      },
    },
  })

  return {
    election,
    electionAdmin,
    candidateInvites,
  }
}
