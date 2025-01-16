import { env } from "$env/dynamic/private"
import { PrismaClient as client, Prisma } from "@prisma/client"

export const PrismaClient = new client({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
}).$extends({
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        where: Prisma.Args<T, 'findFirst'>['where']
      ): Promise<boolean> {
        const context = Prisma.getExtensionContext(this)
        const result = await (context as any).findFirst({ where })
        return result !== null
      },
    },
  },
})
