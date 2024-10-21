import { env } from "$env/dynamic/private"
import { PrismaClient } from "@prisma/client"
import { createStoreFolder } from "./store"

await createStoreFolder()

export const Prisma: PrismaClient = new PrismaClient({
	datasources: {
		db: {
			url: env.DATABASE_URL,
		},
	},
})
