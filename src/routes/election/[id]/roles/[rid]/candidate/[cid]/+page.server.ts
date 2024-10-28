import { Prisma } from "$lib/server/db"
import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ parent, params }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { session } = await parent()

	const candidate = await Prisma.candidate.findUnique({
		where: {
			id: Number(params.cid),
			role: {
				id: Number(params.rid),
				election: {
					id: Number(params.id),
				},
			},
		},
	})

	if (!candidate) {
		error(404, "Candidate not found")
	}

	return {
		candidate,
	}
}
