import { env } from "$env/dynamic/private"
import { PrismaClient, Prisma as prisma } from "@prisma/client"

const PrismaA = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
})

export const Prisma = PrismaA
