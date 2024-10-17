import type { PageServerLoad } from "./$types"
import { fail, redirect } from "@sveltejs/kit"

import { MainDB } from "$lib/server/db"

import { superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const newElectionSchema = z.object({
	name: z.string()
})

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent()

	const newElectionForm = await superValidate(zod(newElectionSchema))

	// Not Logged in
	if (!session?.user?.uniID) {
		return redirect(307, "/")
	}

	return {
		newElectionForm
	}
}

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.auth()
		const form = await superValidate(request, zod(newElectionSchema))

		if (!session?.user?.uniID || !form.valid) {
			return fail(400, { form })
		}

		const election = await MainDB.election.create({
			data: {
				name: form.data.name,
				admins: {
					connectOrCreate: {
						where: {
							uniID: session.user.uniID
						},
						create: {
							uniID: session.user.uniID
						}
					}
				}
			}
		})

		return redirect(303, `/e/${election.id}`);
	}
}
