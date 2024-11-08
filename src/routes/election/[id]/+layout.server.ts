import { Prisma } from "$lib/server/db"
import { isElectionAdmin } from "$lib/server/election"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	const id = Number(params.id)

	const admin = session?.user?.uniID
		? await isElectionAdmin(id, session.user.uniID)
		: false

	const election = await Prisma.election.findUnique({
		where: {
			id,
			published: admin ? undefined : true,
		},
		include: {
			roles: {
				include: {
					candidates: true,
				},
			},
		},
	})

	if (!election) {
		error(404, "Election not found")
	}

	return {
		election,
		admin,
	}
}
