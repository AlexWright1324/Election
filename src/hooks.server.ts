import { handle as AuthHandle } from "$lib/server/auth"
import { PrismaClient } from "$lib/server/db"

import { sequence } from "@sveltejs/kit/hooks"
import { enhance } from "@zenstackhq/runtime"

const ZenStackHandle: typeof handle = async ({ event, resolve }) => {
  const session = await event.locals.auth()

  event.locals.user = session?.user

  const user = event.locals.user

  event.locals.db = enhance(PrismaClient, {
    user: event.locals.user,
  })

  return resolve(event)
}

export const handle = sequence(AuthHandle, ZenStackHandle)
