import { mkdir, access, constants, copyFile } from "node:fs/promises"
import { join } from "node:path"

import { PrismaClient as MainPrismaClient } from "@prisma-app/main"
import { PrismaClient as ElectionPrismaClient } from "@prisma-app/election"
import { PrismaClient as CompetitionPrismaClient } from "@prisma-app/competition"

import { createElectionFolder } from "$lib/server/store"

async function DBCreateIfNotExists(dbName: string, dbPath?: string) {
	dbPath = join("store", dbPath ? dbPath : "")
	await mkdir(dbPath, { recursive: true })
	if (
		await access(join(dbPath, dbName), constants.F_OK)
			.then(() => false)
			.catch(() => true)
	) {
		await copyFile(join("prisma", "db", dbName), join(dbPath, dbName))
	}
	return `file:../${join(dbPath, dbName)}`
}

export const MainDB = new MainPrismaClient({ datasourceUrl: await DBCreateIfNotExists("main.db") })

const ElectionDBMap = new Map<number, ElectionPrismaClient>()

export const ElectionDB = async (id: number) => {
	let electionDB = ElectionDBMap.get(id)
	if (!electionDB) {
		await createElectionFolder(id)
		electionDB = new ElectionPrismaClient({ datasourceUrl: await DBCreateIfNotExists("election.db", id.toString()) })
		ElectionDBMap.set(id, electionDB)
	}
	return electionDB
}
