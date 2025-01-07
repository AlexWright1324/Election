import { env } from "$env/dynamic/private"
import { PrismaClient } from "@prisma/client"

export const Prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
})
