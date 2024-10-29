import { fail } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

import { Prisma } from "$lib/server/db"
import { isElectionAdmin } from "$lib/server/election"

import { message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const editRoleSchema = z.object({
	id: z.number(),
	name: z.string(),
	seatsToFill: z.number().refine((n) => n >= 1),
})

const deleteRoleSchema = z.object({
	id: z.number(),
})

export const load: PageServerLoad = async ({ parent }) => {
	const { election } = await parent()

	return {
		election,
		editRoleForm: await superValidate(zod(editRoleSchema)),
		deleteRoleForm: await superValidate(zod(deleteRoleSchema)),
	}
}

export const actions = {
	createRole: async ({ locals, params }) => {
		const session = await locals.auth()

		if (!session?.user?.uniID) {
			return fail(403, { message: "You are not logged in" })
		}

		const admin = await isElectionAdmin(Number(params.id), session.user.uniID)
		if (!admin) {
			return fail(403, { message: "You are not an admin" })
		}

		await Prisma.role.create({
			data: {
				election: {
					connect: {
						id: Number(params.id),
					},
				},
			},
		})
	},
	editRole: async ({ request, locals, params }) => {
		const session = await locals.auth()
		const form = await superValidate(request, zod(editRoleSchema))

		if (!session?.user?.uniID || !form.valid) {
			return fail(400, { form })
		}

		const admin = await isElectionAdmin(Number(params.id), session.user.uniID)
		if (!admin) {
			return fail(403, { message: "You are not an admin" })
		}

		await Prisma.role.update({
			where: {
				id: form.data.id,
			},
			data: {
				name: form.data.name,
				seatsToFill: form.data.seatsToFill,
			},
		})

		return message(form, "Updated")
	},
	deleteRole: async ({ request, locals, params }) => {
		const session = await locals.auth()
		const form = await superValidate(request, zod(deleteRoleSchema))

		if (!session?.user?.uniID || !form.valid) {
			return fail(400)
		}

		if (!isElectionAdmin(Number(params.id), session.user.uniID)) {
			return fail(403, { message: "You are not an admin" })
		}

		await Prisma.role.delete({
			where: {
				id: form.data.id,
			},
		})

		return message(form, "Deleted")
	},
}
