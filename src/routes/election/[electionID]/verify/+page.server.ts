import { requireElection } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { signatureSchema } from "./schema"

import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireElection({ id: true }, async () => {
  return {
    voteForm: await superValidate(zod(signatureSchema)),
  }
})

export const actions = {
  verify: requireElection(
    {
      id: true,
    },
    async ({ request, election }) => {
      const form = await superValidate(request, zod(signatureSchema))

      if (!form.valid) {
        return fail(400, { form })
      }

      const ballot = await PrismaClient.ballot.findUnique({
        where: {
          signature: form.data.signature,
          election: {
            id: election.id,
          },
        },
        select: {
          candidateVotes: {
            select: {
              position: true,
              candidate: {
                select: {
                  id: true,
                  isRON: true,
                  users: {
                    select: {
                      name: true,
                    },
                  },
                  role: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
          motionVotes: {
            select: {
              motion: {
                select: {
                  id: true,
                  name: true,
                },
              },
              vote: true,
            },
          },
        },
      })

      if (!ballot) {
        return setError(form, "", "Invalid signature")
      }

      return { form, ballot }
    },
  ),
}
