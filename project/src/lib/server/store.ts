import { mkdir } from "node:fs/promises"

export const createElectionFolder = async (id: number) => {
	await mkdir(`store/${id}`, { recursive: true })
}