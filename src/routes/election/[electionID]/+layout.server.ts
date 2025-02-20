import { requireElection } from "$lib/server/auth"

export const load = requireElection(
  {
    id: true,
  },
  async ({ election }) => {
    return {
      election,
    }
  },
)
