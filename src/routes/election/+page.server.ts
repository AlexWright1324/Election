import { Prisma } from "$lib/server/db"
import { fail, redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent()

	const elections = await Prisma.election.findMany({
		where: {
			published: true,
		},
	})
	const managedElections = session?.user.uniID
		? await Prisma.election.findMany({
				where: {
					admins: {
						some: {
							uniID: session.user.uniID,
						},
					},
				},
			})
		: []

	return {
		elections,
		managedElections,
	}
}

export const actions = {
	create: async ({ locals }) => {
		const session = await locals.auth()

		if (!session?.user?.uniID) {
			return fail(403, { message: "You are not logged in" })
		}

		const election = await Prisma.election.create({
			data: {
				admins: {
					connectOrCreate: {
						where: {
							uniID: session.user.uniID,
						},
						create: {
							uniID: session.user.uniID,
						},
					},
				},
			},
		})

		return redirect(303, `/election/${election.id}`)
	},
}
