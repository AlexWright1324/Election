import { requireElection } from "$lib/server/auth"

export const load = requireElection(
  {
    motionEnabled: true,
    start: true,
  },
  async ({ election }) => {
    return {
      election,
    }
  },
)
