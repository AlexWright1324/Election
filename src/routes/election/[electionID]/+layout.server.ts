import { UserIsElectionAdmin } from "$lib/client/checks.js"
import { requireElection } from "$lib/server/auth"

export const load = requireElection(
  {
    id: true,
    admins: {
      select: {
        userID: true,
      },
    },
  },
  async ({ election, locals }) => {
    const isAdmin = UserIsElectionAdmin(election, locals.session?.user)

    return {
      election: {
        id: election.id,
        isAdmin: isAdmin.allow === true,
      },
    }
  },
)
