import { error, fail } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

import { Prisma } from "$lib/server/db"

import { message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const electionUpdateSchema = z.object({
	description: z.string(),
})

export const load: PageServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	if (!session?.user?.uniID) {
		error(403, "You are not logged in")
	}

	const election = await Prisma.election.findUnique({
		where: {
			id: Number(params.id),
		},
		include: {
			admins: {
				where: {
					uniID: session.user.uniID,
				},
			},
			roles: {
				include: {
					candidates: true,
				},
			},
			voters: {
				select: {
					userID: true,
				},
			},
		},
	})

	if (!election) {
		error(403, "You are not an admin")
	}

	const electionUpdateForm = await superValidate(
		election,
		zod(electionUpdateSchema),
	)

	return {
		election,
		electionUpdateForm,
	}
}

export const actions = {
	default: async ({ request, locals, params }) => {
		const session = await locals.auth()
		const form = await superValidate(request, zod(electionUpdateSchema))

		if (!session?.user?.uniID || !form.valid) {
			return fail(400, { form })
		}

		await Prisma.election.update({
			where: {
				id: Number(params.id),
			},
			data: {
				description: form.data.description,
			},
		})

		return message(form, "Updated")
	},
}
