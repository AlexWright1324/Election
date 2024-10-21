import { mkdir } from "node:fs/promises"
import { join } from "node:path"

export const createStoreFolder = async () => {
	await mkdir("store", { recursive: true })
}

export const createElectionFolder = async (id: string) => {
	const path = join("store/elections", id, "candidates")
	await mkdir(path, { recursive: true })
}

export const createCompetitionFolder = async (id: string) => {
	await mkdir(`store/competitions/${id}/rounds`, { recursive: true })
}
