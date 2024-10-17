import type { PageServerLoad } from "./$types"
import { MainDB } from "$lib/server/db"
import { error } from "@sveltejs/kit"

export const load: PageServerLoad = async ({ parent, params }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { session } = await parent()

	const election = await MainDB.election.findUnique({
        where: {
            id: Number(params.id)
        }
    })

	if (!election) {
		error(404, "Election not found")
	}

	return {
		election
	}
}
