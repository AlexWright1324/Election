import { requireCandidate } from "$lib/server/auth"

export const load = requireCandidate(
  {
    id: true,
    users: {
      select: {
        userID: true,
      },
    },
    role: {
      select: {
        election: {
          select: {
            id: true,
          },
        },
      },
    },
  },
  async ({ candidate, locals }) => {
    const isCandidateAdmin = candidate.users.some((user) => user.userID === locals.session?.user.userID)

    return {
      candidate: {
        id: candidate.id,
        role: candidate.role,
      },
      isCandidateAdmin,
    }
  },
)
