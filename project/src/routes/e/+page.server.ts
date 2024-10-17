import type { PageServerLoad } from "./$types"
import { MainDB } from "$lib/server/db"

export const load: PageServerLoad = async ({ parent }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { session } = await parent()

	const elections = await MainDB.election.findMany()
	
	return {
		elections
	}
}
