import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { PrismaClient } from "$lib/server/db"
import { fail, type RequestEvent } from "@sveltejs/kit"
import { isCandidateAdmin, isElectionAdmin } from "./election"

declare module "@auth/sveltekit" {
  interface Session {
    user: {
      name: string
      email: string
      id: string
      groups: string[]
      userID: string
    }
  }

  // From Keycloak
  interface Profile {
    groups: string[]
    uni_id: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    sub: string
    groups: string[]
    uni_id: string
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [Keycloak],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.groups = token.groups
      session.user.userID = token.uni_id

      return session
    },
    async jwt({ token, profile }) {
      if (!profile) return token
      if (!profile.sub) return token

      token.sub = profile.sub
      token.groups = profile.groups
      token.uni_id = profile.uni_id
      return token
    },
    async signIn({ profile }) {
      if (!profile?.uni_id || !profile?.name) {
        // No userID, cant sign in
        return false
      }

      // Find or create user
      await PrismaClient.user.upsert({
        where: { userID: profile.uni_id },
        update: {
          name: profile.name,
        },
        create: {
          userID: profile.uni_id,
          name: profile.name,
        },
      })

      return true
    },
  },
})

type Handler<T = any> = (
  event: RequestEvent & T
) => any

interface AuthContext {
  userID: string
}

interface ElectionContext extends AuthContext {
  electionID: number
}

interface CandidateContext extends AuthContext {
  candidateID: number
}

interface MotionContext extends AuthContext {
  motionID: number
}

export const requireAuth = (handler: Handler<AuthContext>) => {
  return async (event: RequestEvent) => {
    const session = await event.locals.auth()
    if (!session) {
      return fail(401, { message: "You must be logged in" })
    }

    return handler({ ...event, userID: session.user.userID })
  }
}

export const requireElectionAdmin = (handler: Handler<ElectionContext>) => {
  return requireAuth(async (event) => {
    const electionID = Number(event.params.electionID)
    const isAdmin = await isElectionAdmin(electionID, event.userID)

    if (!isAdmin) {
      return fail(403, { message: "You are not an admin of this election" })
    }

    return handler({ ...event, electionID })
  })
}

export const requireCandidateAdmin = (handler: Handler<CandidateContext>) => {
  return requireAuth(async (event) => {
    const candidateID = Number(event.params.candidateID)
    const isAdmin = await isCandidateAdmin(candidateID, event.userID)

    if (!isAdmin) {
      return fail(403, { message: "You are not a admin for this candidate" })
    }

    return handler({ ...event, candidateID })
  })
}

export const requireMotionAdmin = (handler: Handler<MotionContext>) => {
  return requireAuth(async (event) => {
    const motionID = Number(event.params.motionID)
    const isAdmin = await PrismaClient.motion.findFirst({
      where: {
        id: motionID,
        proposerID: event.userID,
      },
    })

    if (!isAdmin) {
      return fail(403, { message: "You are not an admin of this election" })
    }

    return handler({ ...event, motionID })
  })
}
