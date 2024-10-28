import { rm } from "node:fs/promises"
import { Prisma } from "$lib/server/db"

export const isElectionAdmin = async (
	electionID: number,
	userID: string,
): Promise<boolean> => {
	const election = await Prisma.election.findUnique({
		where: {
			id: electionID,
			admins: {
				some: {
					uniID: userID,
				},
			},
		},
	})
	return election !== null
}

export const deleteElection = async (electionID: number) => {
	await Prisma.election.delete({
		where: {
			id: electionID,
		},
	})

	await rm(`store/elections/${electionID}`, { recursive: true, force: true })
}
