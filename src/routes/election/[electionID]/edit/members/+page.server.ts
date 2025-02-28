import { requireElectionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { getMembers } from "$lib/server/suapi"

import { emptySchema, updateApiKeySchema, editMemberSchema } from "./schema"

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
      members: election.members,
      updateApiKeyForm: await superValidate({ apiKey: election.apiKey }, zod(updateApiKeySchema)),
      populateMembersForm: await superValidate(zod(emptySchema)),
      editMemberForm: await superValidate(zod(editMemberSchema)),
    }
  },
)

export const actions = {
  updateApiKey: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(updateApiKeySchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    // TODO: TEST APIKEY

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        apiKey: form.data.apiKey,
      },
    })

    return message(form, "API Key updated")
  }),
  populateMembers: requireElectionAdmin({ id: true, apiKey: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(emptySchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    let members
    try {
      members = await getMembers(election.apiKey)
    } catch (error) {
      if (error instanceof Error) {
        return setError(form, "", error.message)
      }
      throw error
    }

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        members: {
          set: [],
          connectOrCreate: members.map((member) => ({
            where: { userID: member.userID },
            create: {
              userID: member.userID,
              name: member.name, // TODO: Validate name?
            },
          })),
        },
      },
    })
  }),
  addMember: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(editMemberSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        members: {
          connectOrCreate: {
            where: { userID: form.data.userID },
            create: {
              userID: form.data.userID,
              name: "",
            },
          },
        },
      },
    })

    return message(form, "Member added")
  }),
  removeMember: requireElectionAdmin({ id: true }, async ({ request, election }) => {
    const form = await superValidate(request, zod(editMemberSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    await PrismaClient.election.update({
      where: { id: election.id },
      data: {
        members: {
          disconnect: {
            userID: form.data.userID,
          },
        },
      },
    })

    return message(form, "Member removed")
  }),
}
