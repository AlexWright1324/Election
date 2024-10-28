import { Prisma } from "$lib/server/db"
import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	const id = Number(params.id)

	const election = await Prisma.election.findUnique({
		where: {
			id,
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

	const admin =
		(await Prisma.election.findUnique({
			where: {
				id: election.id,
				admins: {
					some: {
						uniID: session?.user?.uniID,
					},
				},
			},
		})) != null

	return {
		election,
		admin,
	}
}
