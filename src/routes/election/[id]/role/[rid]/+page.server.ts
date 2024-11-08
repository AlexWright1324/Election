import { Prisma } from "$lib/server/db.js"
import { fail, redirect } from "@sveltejs/kit"

export const actions = {
	default: async ({ locals, params }) => {
		const session = await locals.auth()

		if (!session?.user?.uniID) {
			return fail(403, { message: "You are not logged in" })
		}

		const candidate = await Prisma.candidate.create({
			data: {
				name: session.user.name ? session.user.name : "Nameless",
				role: {
					connect: {
						id: Number(params.rid),
					},
				},
				users: {
					connect: {
						uniID: session.user.uniID,
					},
				},
			},
		})

		return redirect(
			303,
			`/election/${params.id}/role/${params.rid}/candidates/${candidate.id}`,
		)
	},
}
