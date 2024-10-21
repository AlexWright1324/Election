import { Prisma } from "$lib/server/db"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ parent }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { session } = await parent()

	const elections = await Prisma.election.findMany()

	return {
		elections,
	}
}
