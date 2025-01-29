import { PrismaClient } from "$lib/server/db"
import { isElectionAdmin } from "$lib/server/election"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { session } = await parent()

  const id = Number(params.electionID)

  const electionAdmin = session?.user.userID ? await isElectionAdmin(id, session.user.userID) : false

  const election = await PrismaClient.election.findUnique({
    where: {
      id,
      published: electionAdmin ? undefined : true,
    },
    include: {
      roles: {
        include: {
          candidates: {
            include: {
              users: {
                select: {
                  name: true,
                },
                where: {
                  userID: session?.user?.userID,
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
      userID: session?.user?.userID,
    },
    include: {
      candidate: true,
    },
  })

  return {
    election,
    electionAdmin,
    candidateInvites,
  }
}
