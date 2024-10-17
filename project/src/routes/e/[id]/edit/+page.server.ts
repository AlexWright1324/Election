import type { PageServerLoad } from "./$types"
import { error, fail } from "@sveltejs/kit"

import { ElectionDB, MainDB } from "$lib/server/db"

import { message, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const electionUpdateSchema = z.object({
	description: z.string()
})

export const load: PageServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	
	const election = await MainDB.election.findUnique({
		where: {
			id: Number(params.id)
        },
    })
	
	if (!election) {
		error(404, "Election not found")
	}
	
	const electionUpdateForm = await superValidate(election, zod(electionUpdateSchema))

	const user = await MainDB.user.findUnique({
		where: {
			uniID: session?.user.uniID,
			elections: {
				some: {
					id: election.id
				}
			}
		}
	})
	const admin = user !== undefined

	if (!admin) {
		error(403, "You are not an admin")
	}

	const electionDB = await ElectionDB(election.id)
	const roles = await electionDB.role.findMany()
	const electionCandidates = electionDB.candidate.findMany()

	return {
		election,
		electionCandidates,
		roles,
		electionUpdateForm
	}
}

export const actions = {
	default: async ({ request, locals, params }) => {
		const session = await locals.auth()
		const form = await superValidate(request, zod(electionUpdateSchema))

		if (!session?.user?.uniID || !form.valid) {
			return fail(400, { form })
		}

		await MainDB.election.update({
			where: {
				id: Number(params.id)
			},
			data: {
				description: form.data.description,
			}
		})

		return message(form, "Updated");
	}
}
