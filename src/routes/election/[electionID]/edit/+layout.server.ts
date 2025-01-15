import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

import { Prisma } from "$lib/server/db"

export const load: LayoutServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	if (!session?.user?.uniID) {
		error(403, "You are not logged in")
	}

	const electionID = Number(params.electionID)

	const election = await Prisma.election.findUnique({
		where: {
			id: electionID,
			admins: {
				some: {
					uniID: session.user.uniID,
				},
			},
		},
		include: {
			admins: true,
			roles: {
				include: {
					candidates: true,
				},
			},
		},
	})

	if (!election) {
		error(403, "You are not an admin")
	}

	return {
		election,
	}
}
