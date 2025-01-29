import type { PageServerLoad } from "./$types"

import { PrismaClient } from "$lib/server/db"
import { isElectionAdmin } from "$lib/server/election"

import { message, fail, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"
import { requireElectionAdmin } from "$lib/server/auth"

const editRolesSchema = z.object({
  roles: z.array(
    z.object({
      id: z.number().nullable(),
      name: z.string(),
      seatsToFill: z.number().refine((n) => n >= 1),
    })
  ),
})

export const load: PageServerLoad = async ({ parent }) => {
  const { election } = await parent()

  return {
    editRolesForm: await superValidate({ roles: election.roles }, zod(editRolesSchema)),
  }
}

export const actions = {
  editRoles: requireElectionAdmin(async ({ request, electionID }) => {
    const form = await superValidate(request, zod(editRolesSchema))
    if (!form.valid) return fail(400, { form })

    await PrismaClient.$transaction(async (tx) => {
      // Get existing roles for comparison
      const existingRoles = await tx.role.findMany({
        where: { electionID },
      })

      const existingIds = new Set(existingRoles.map((r) => r.id))
      const updatedIds = new Set(form.data.roles.map((r) => r.id).filter((id) => id !== null))

      // Delete removed roles
      const idsToDelete = [...existingIds].filter((id) => !updatedIds.has(id))
      if (idsToDelete.length > 0) {
        await tx.role.deleteMany({
          where: { id: { in: idsToDelete } },
        })
      }

      // Update or create roles
      for (const role of form.data.roles) {
        if (role.id) {
          await tx.role.update({
            where: { id: role.id },
            data: {
              name: role.name,
              seatsToFill: role.seatsToFill,
            },
          })
        } else {
          await tx.role.create({
            data: {
              name: role.name,
              seatsToFill: role.seatsToFill,
              electionID,
            },
          })
        }
      }
    })

    return message(form, "Updated")
  }),
}
