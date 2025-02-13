import { handle as AuthHandle } from "$lib/server/auth"

import type { Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

const LocalsHandle: Handle = async ({ event, resolve }) => {
  event.locals.session = await event.locals.auth()

  return resolve(event)
}

export const handle = sequence(AuthHandle, LocalsHandle)
