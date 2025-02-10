import { requireElectionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { getMembers } from "$lib/server/suapi"

import { fail, message, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const updateApiKeySchema = z.object({
  apiKey: z.string().refine((apiKey) => apiKey.length === 36, {
    message: "API Key must be 36 characters long",
  }),
})

const emptySchema = z.object({})

const updateMembersSchema = z.object({
  members: z.array(
    z.object({
      userID: z.string(),
      name: z.string(),
    }),
  ),
})

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
      populateMembersForm: await superValidate(zod(emptySchema)),
      updateMembersForm: await superValidate({ members: election.members }, zod(updateMembersSchema)),
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

    const memberConnections = form.data.members.map((member) => ({
      where: { userID: member.userID },
      create: {
        userID: member.userID,
        name: member.name, // TODO: Validate name
      },
    }))

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        members: {
          set: [],
          connectOrCreate: memberConnections,
        },
      },
    })

    return message(form, "Members updated")
  }),
}
