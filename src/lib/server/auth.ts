import { PrismaClient, type Prisma } from "$lib/server/db"

import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { error, fail, type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit"

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
        update: { name: profile.name },
        create: { userID: profile.uni_id, name: profile.name },
      })

      return true
    },
  },
})

type LoadOrAction = ServerLoadEvent | RequestEvent

const isServerLoad = (event: LoadOrAction): event is ServerLoadEvent => {
  return (event as ServerLoadEvent).parent !== undefined
}

const handleFailure = <E extends LoadOrAction>(event: LoadOrAction, status: number, message: string) => {
  return (isServerLoad(event)
    ? error(status, message)
    : fail(status, { message })) as unknown as E extends ServerLoadEvent ? ReturnType<typeof error> : never
}

export const requireAuth = <T extends LoadOrAction, R>(handler: (event: T & { userID: string }) => Promise<R> | R) => {
  return async (event: T) => {
    if (!event.locals.session) return handleFailure(event, 401, "Unauthorised")
    return handler({ ...event, userID: event.locals.session.user.userID })
  }
}

export const requireElection = <T extends LoadOrAction, S extends Prisma.ElectionSelect, R>(
  select: S,
  handler: (event: T & { election: Prisma.ElectionGetPayload<{ select: S }> }) => Promise<R> | R,
) => {
  return async (event: T) => {
    const electionID = event.params.electionID
    if (!electionID) return handleFailure(event, 400, "Missing election ID")

    const electionExists = await PrismaClient.election.findUnique({
      where: { id: electionID },
      select: { published: true, admins: { select: { userID: true } } },
    })

    if (!electionExists) return handleFailure(event, 404, "Election not found")

    if (!electionExists.published) {
      const isAdmin = electionExists.admins.some((admin) => admin.userID === event.locals.session?.user.userID)
      if (!isAdmin) return handleFailure(event, 403, "Election not published")
    }

    const election = await PrismaClient.election.findUnique({
      where: {
        id: electionID,
      },
      select,
    })

    if (!election) return handleFailure(event, 404, "Election not found?")

    return handler({ ...event, election })
  }
}

export function requireElectionAdmin<T extends LoadOrAction, S extends Prisma.ElectionSelect, R>(
  select: S,
  handler: (event: T & { election: Prisma.ElectionGetPayload<{ select: S }>; userID: string }) => Promise<R> | R,
) {
  return requireAuth(async (event: T & { userID: string }) => {
    const electionID = event.params.electionID
    if (!electionID) return handleFailure(event, 400, "Missing election ID")

    const electionExists = await PrismaClient.election.exists({ id: electionID })

    if (!electionExists) return handleFailure(event, 404, "Election not found")

    const election = await PrismaClient.election.findUnique({
      where: {
        id: electionID,
        admins: { some: { userID: event.userID } },
      },
      select,
    })

    if (!election) return handleFailure(event, 403, "Not an election admin")

    return handler({ ...event, election })
  })
}

export const requireCandidate = <T extends LoadOrAction, S extends Prisma.CandidateSelect, R>(
  select: S,
  handler: (event: T & { candidate: Prisma.CandidateGetPayload<{ select: S }> }) => Promise<R> | R,
) => {
  return async (event: T) => {
    const candidateID = event.params.candidateID
    if (!candidateID) return handleFailure(event, 400, "Missing candidate ID")

    const candidate = await PrismaClient.candidate.findUnique({
      where: {
        id: candidateID,
      },
      select,
    })

    if (!candidate) return handleFailure(event, 404, "Candidate not found")

    return handler({ ...event, candidate })
  }
}

export const requireCandidateAdmin = <T extends LoadOrAction, S extends Prisma.CandidateSelect, R>(
  select: S,
  handler: (event: T & { candidate: Prisma.CandidateGetPayload<{ select: S }>; userID: string }) => Promise<R> | R,
) => {
  return requireAuth(async (event: T & { userID: string }) => {
    const candidateID = event.params.candidateID

    const candidateExists = await PrismaClient.candidate.exists({
      id: candidateID,
    })

    if (!candidateExists) return handleFailure(event, 404, "Candidate not found")

    const candidate = await PrismaClient.candidate.findUnique({
      where: {
        id: candidateID,
        users: {
          some: {
            userID: event.userID,
          },
        },
      },
      select,
    })

    if (!candidate) return handleFailure(event, 403, "You are not an admin of this candidate")

    return handler({ ...event, candidate })
  })
}

export const requireMotion = <T extends LoadOrAction, S extends Prisma.MotionSelect, R>(
  select: S,
  callback: (event: T & { motion: Prisma.MotionGetPayload<{ select: S }> }) => Promise<R> | R,
) => {
  return async (event: T) => {
    const motionID = event.params.motionID
    if (!motionID) return handleFailure(event, 400, "Missing motion ID")

    const motion = await PrismaClient.motion.findUnique({
      where: {
        id: motionID,
      },
      select,
    })

    if (!motion) return handleFailure(event, 404, "Motion not found")

    return callback({ ...event, motion })
  }
}

export const requireMotionAdmin = <T extends LoadOrAction, S extends Prisma.MotionSelect, R>(
  select: S,
  callback: (event: T & { motion: Prisma.MotionGetPayload<{ select: S }> }) => Promise<R> | R,
) => {
  return requireAuth(async (event: T & { userID: string }): Promise<R> => {
    const motionID = event.params.motionID
    if (!motionID) return handleFailure(event, 400, "Missing motion ID")

    const motionExists = await PrismaClient.motion.exists({ id: motionID })

    if (!motionExists) return handleFailure(event, 404, "Motion not found")

    const motion = await PrismaClient.motion.findUnique({
      where: {
        id: motionID,
        proposer: {
          userID: event.userID,
        },
      },
      select,
    })

    if (!motion) return handleFailure(event, 403, "You are not the proposer of this Motion")

    return callback({ ...event, motion })
  })
}
