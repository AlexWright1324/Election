import { requireCandidateAdmin } from "$lib/server/auth"

export const load = requireCandidateAdmin(
  {
    id: true,
    description: true,
    roles: true,
    users: true,
    userInvites: true,
  },
  async ({ candidate }) => {
    return {
      candidate,
    }
  },
)
