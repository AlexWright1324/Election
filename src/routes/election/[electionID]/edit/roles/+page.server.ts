import { requireElectionAdmin } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"
import { enforceRON } from "$lib/server/election.js"

import { message, fail, superValidate, setError } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const editRolesSchema = z.object({
  roles: z
    .object({
      id: z.number().nullable(),
      name: z.string().min(2),
      seatsToFill: z.number().min(1),
    })
    .array(),
})

export const load = requireElectionAdmin(
  {
    roles: {
      select: {
        id: true,
        name: true,
        seatsToFill: true,
      },
    },
  },
  async ({ election }) => {
    return {
      editRolesForm: await superValidate({ roles: election.roles }, zod(editRolesSchema)),
    }
  },
)

export const actions = {
  editRoles: requireElectionAdmin(
    {
      id: true,
      roles: {
        select: {
          id: true,
        },
      },
      start: true,
    },
    async ({ request, election, locals, cookies }) => {
      const form = await superValidate(request, zod(editRolesSchema))
      if (!form.valid) return fail(400, { form })
      const bypass = locals.session?.user.admin ? cookies.get("bypass") === "true" : false
      if (!bypass && election.start && election.start < new Date()) return setError(form, "", "Election has started")
      const existingIds = new Set(election.roles.map((r) => r.id))
      const updatedIds = new Set(form.data.roles.map((r) => r.id).filter((id) => id !== null))
      const idsToDelete = [...existingIds].filter((id) => !updatedIds.has(id))
      const update = form.data.roles
        .filter((r) => r.id !== null)
        .map((r) => ({
          where: { id: r.id as number },
          data: { name: r.name, seatsToFill: r.seatsToFill },
        }))
      const create = form.data.roles
        .filter((r) => r.id === null)
        .map((r) => ({ name: r.name, seatsToFill: r.seatsToFill }))

      await PrismaClient.$transaction(async (tx) => {
        await tx.election.update({
          where: { id: election.id },
          data: {
            roles: {
              deleteMany: {
                id: { in: idsToDelete },
              },
              update,
              create,
            },
          },
        })
        await enforceRON(tx, election.id)
      })

      return message(form, "Updated")
    },
  ),
}
