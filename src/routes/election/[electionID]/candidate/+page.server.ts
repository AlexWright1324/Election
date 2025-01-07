import { Prisma } from "$lib/server/db"
import { fail, redirect } from "@sveltejs/kit"

export const actions = {
  signup: async ({ locals, params, request }) => {
    const session = await locals.auth()
    const formData = await request.formData()
    const roleID = formData.get("roleID")

    if (!session?.user?.uniID) {
      return fail(403, { message: "You are not logged in" })
    }
    const electionID = Number(params.electionID)

    const election = await Prisma.election.findUnique({
      where: {
        id: electionID,
      },
    })
    if (!election) {
      return fail(404, { message: "Election not found" })
    }

    const role = await Prisma.role.findUnique({
      where: {
        id: Number(roleID),
        electionID,
      },
    })
    if (!role) {
      return fail(404, { message: "Role not found" })
    }

    // Check if user is already a candidate in the role
    let candidate = await Prisma.candidate.findFirst({
      where: {
        roles: {
          some: {
            id: role.id,
          },
        },
        users: {
          some: {
            uniID: session.user.uniID,
          },
        },
      },
    })

    if (candidate) {
      return fail(400, { message: "You are already a candidate for this role" })
    }

    candidate = await Prisma.candidate.findFirst({
      where: {
        electionID,
        users: {
          some: {
            uniID: session.user.uniID,
          },
        },
      },
    })

    if (candidate) {
      candidate = await Prisma.candidate.update({
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
      candidate = await Prisma.candidate.create({
        data: {
          name: session.user.name,
          electionID: election.id,
          roles: {
            connect: {
              id: role.id,
            },
          },
          users: {
            connect: {
              uniID: session.user.uniID,
            },
          },
        },
      })
    }

    return redirect(303, `/election/${electionID}/candidate/${candidate.id}`)
  },
}
