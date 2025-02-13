import { env } from "$env/dynamic/private"
import { PrismaClient as client, Prisma } from "@prisma/client"

const baseClient = new client({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
})

const existsClient = baseClient.$extends({
  model: {
    $allModels: {
      async exists<T>(this: T, where: Prisma.Args<T, "findFirst">["where"]): Promise<boolean> {
        const context = Prisma.getExtensionContext(this)
        const result = await (context as any).findFirst({ where })
        return result !== null
      },
    },
  },
})

// Cant do this because of the way prisma works
/* const extrasClient = existsClient.$extends({
  result: {
    candidate: {
      name: {
        needs: {
          id: true,
          // @ts-ignore
          users: true,
        },
        async compute(candidate) {
          if (!candidate.users) return ""
          return seperateJoin(candidate.users.map((user) => user.name))
        },
      },
    },
  },
}) */

export const PrismaClient = existsClient
export { Prisma } from "@prisma/client"
