import { mkdir } from "node:fs/promises"
import { join } from "node:path"

export const storePath = "store"

export const createCompetition = async (id: string) => {
	const path = join(storePath, "competitions", id, "rounds")
	await mkdir(path, { recursive: true })
}
