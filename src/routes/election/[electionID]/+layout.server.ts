import { error } from "@sveltejs/kit"

export const load = async ({ params, locals }) => {
  const election = await locals.db.election.findUnique({
    where: {
      id: params.electionID,
    },
    include: {
      admins: true,
      roles: {
        include: {
          candidates: {
            include: {
              users: true,
            },
          },
        },
      },
      motions: true,
    },
  })

  if (!election) {
    return error(404, "Election not found")
  }

  return {
    election,
  }
}
