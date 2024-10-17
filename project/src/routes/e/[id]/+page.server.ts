import type { PageServerLoad } from "./$types"
import { ElectionDB, MainDB } from "$lib/server/db"
import { error } from "@sveltejs/kit"

export const load: PageServerLoad = async ({ parent, params }) => {
	const { session } = await parent()

	const election = await MainDB.election.findUnique({
        where: {
            id: Number(params.id)
        },
    })
	
	if (!election) {
		error(404, "Election not found")
	}
	const electionDB = await ElectionDB(election.id)
	const electionCandidates = electionDB.candidate.findMany()

	const roles = await electionDB.role.findMany()

	const user = await MainDB.user.findUnique({
		where: {
			uniID: session?.user.uniID,
			elections: {
				some: {
					id: election.id
				}
			}
		}
	})
	const admin = user !== undefined

	return {
		election,
		electionCandidates,
		roles,
		admin
	}
}
