import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

import { PrismaClient } from "$lib/server/db"

export const load: LayoutServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	if (!session?.user?.userID) {
		error(403, "You are not logged in")
	}

	const electionID = Number(params.electionID)

	const election = await PrismaClient.election.findUnique({
		where: {
			id: electionID,
			admins: {
				some: {
					userID: session.user.userID,
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
