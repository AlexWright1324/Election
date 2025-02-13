import { requireElectionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { getMembers } from "$lib/server/suapi"

import { emptySchema, updateApiKeySchema, updateMembersSchema } from "./schema"
import { fail, message, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

export const load = requireElectionAdmin(
  {
    apiKey: true,
    members: {
      select: {
        userID: true,
        name: true,
      },
    },
  },
  async ({ election }) => {
    return {
      updateApiKeyForm: await superValidate({ apiKey: election.apiKey }, zod(updateApiKeySchema)),
      updateMembersForm: await superValidate({ members: election.members }, zod(updateMembersSchema)),
      populateMembersForm: await superValidate(zod(emptySchema)),
    }
  },
)

export const actions = {
  updateApiKey: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(updateApiKeySchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        apiKey: form.data.apiKey,
      },
    })

    return message(form, "API Key updated")
  }),
  populateMembers: requireElectionAdmin({ apiKey: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(emptySchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      const members = await getMembers(election.apiKey)
      return { form, APIMembers: members }
    } catch (error) {
      if (error instanceof Error) {
        return setError(form, "", error.message)
      }
    }
  }),
  updateMembers: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(updateMembersSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        members: {
          set: [],
          connectOrCreate: form.data.members.map((member) => ({
            where: { userID: member.userID },
            create: {
              userID: member.userID,
              name: member.name, // TODO: Validate name
            },
          })),
        },
      },
    })

    return message(form, "Members updated")
  }),
}
