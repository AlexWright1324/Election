import { mkdir, access, constants, copyFile } from "node:fs/promises"

import { PrismaClient as MainPrismaClient, type Election } from "@prisma-app/main"
import { PrismaClient as ElectionPrismaClient } from "@prisma-app/election"
import { PrismaClient as CompetitionPrismaClient } from "@prisma-app/competition"

import { createElectionFolder } from "$lib/server/store"

async function DBCreateIfNotExists(dbName: string, dbPath?: string) {
	dbPath = `store/${dbPath ? dbPath : ""}`
	await mkdir(dbPath, { recursive: true })
	if (
		await access(`${dbPath}/${dbName}`, constants.F_OK)
			.then(() => false)
			.catch(() => true)
	) {
		await copyFile(`prisma/db/${dbName}`, `${dbPath}/${dbName}`)
	}
	return `file:../${dbPath}/${dbName}`
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
