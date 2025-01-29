import { requireAuth } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { fail, redirect } from "@sveltejs/kit"

export const actions = {
  signup: requireAuth(async ({ params, request, userID }) => {
    const formData = await request.formData()
    const roleID = formData.get("roleID")

    const electionID = Number(params.electionID)

    const election = await PrismaClient.election.findUnique({
      where: {
        id: electionID,
      },
    })
    if (!election) {
      return fail(404, { message: "Election not found" })
    }

    const role = await PrismaClient.role.findUnique({
      where: {
        id: Number(roleID),
        electionID,
      },
    })
    if (!role) {
      return fail(404, { message: "Role not found" })
    }

    // Check if user is already a candidate in the role
    let candidate = await PrismaClient.candidate.findFirst({
      where: {
        roles: {
          some: {
            id: role.id,
          },
        },
        users: {
          some: {
            userID
          },
        },
      },
    })

    if (candidate) {
      return fail(400, { message: "You are already a candidate for this role" })
    }

    candidate = await PrismaClient.candidate.findFirst({
      where: {
        electionID,
        users: {
          some: {
            userID
          },
        },
      },
    })

    if (candidate) {
      candidate = await PrismaClient.candidate.update({
        where: {
          id: candidate.id,
        },
        data: {
          roles: {
            connect: {
              id: role.id,
            },
          },
        },
      })
    } else {
      candidate = await PrismaClient.candidate.create({
        data: {
          electionID: election.id,
          roles: {
            connect: {
              id: role.id,
            },
          },
          users: {
            connect: {
              userID
            },
          },
        },
      })
    }

    return redirect(303, `/election/${electionID}/candidate/${candidate.id}`)
  }),
}
