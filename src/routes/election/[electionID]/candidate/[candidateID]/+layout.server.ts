import { Prisma } from "$lib/server/db"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { session } = await parent()
  
  // TODO: Election valid

  const electionID = Number(params.electionID)
  const candidateID = Number(params.candidateID)

  const candidate = await Prisma.candidate.findUnique({
    where: {
      id: candidateID,
      electionID: electionID,
    },
    include: {
      roles: true,
      users: true,
    }
  })

  if (!candidate) {
    error(404, "Candidate not found")
  }

  const candidateAdmin = candidate.users.some(user => user.uniID === session?.user.uniID)

  return {
    candidate,
    candidateAdmin
  }
}
