import type { PageServerLoad } from "./$types"
import { ElectionDB, MainDB } from "$lib/server/db"
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

	const candidate = (await ElectionDB(Number(params.id))).candidate.findUnique({
        where: {
            id: Number(params.cid)
        }
    })
	
	if (!candidate) {
		error(404, "Candidate not found")
	}

	return {
		candidate
	}
}
