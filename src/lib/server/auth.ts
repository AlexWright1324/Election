import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { PrismaClient } from "$lib/server/db"
import { error, fail, type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit"
import type { Prisma } from "@prisma/client"

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

type LoadOrAction = ServerLoadEvent | RequestEvent
type ExcludeFailure<R> = Promise<Exclude<Awaited<R>, ReturnType<typeof fail> | ReturnType<typeof error>>>

const isServerLoad = (event: LoadOrAction): event is ServerLoadEvent => {
  return (event as ServerLoadEvent).parent !== undefined
}

const failure = (event: LoadOrAction, status: number, message: string) => {
  return isServerLoad(event) ? fail(status, { message }) : error(status, message)
}

export const requireAuth = <T extends RequestEvent, R>(
  callback: (event: T & { userID: string }) => R | Promise<R>
): ((event: T) => ExcludeFailure<R>) => {
  return async (event: T) => {
    const session = await event.locals.auth()
    if (!session) {
      return failure(event, 401, "You must be logged in") as any
    }

    return callback({ ...event, userID: session.user.userID })
  }
}

export const requireElection = <T extends RequestEvent, R, S extends Prisma.ElectionSelect>(
  select: S,
  callback: (event: T & { election: Prisma.ElectionGetPayload<{ select: S }> }) => Promise<R> | R
): ((event: T) => ExcludeFailure<R>) => {
  return async (event: T) => {
    const electionID = Number(event.params.electionID)

    const electionExists = await PrismaClient.election.findUnique({
      where: {
        id: electionID,
      },
      select: {
        published: true,
        admins: {
          select: {
            userID: true,
          },
        },
      }
    })

    if (!electionExists) {
      return failure(event, 404, "Election not found") as any
    }

    if (electionExists.published === false) {
      const session = await event.locals.auth()
      if (!session) {
        return failure(event, 401, "You must be logged in") as any
      }

      const isAdmin = electionExists.admins.some((admin) => admin.userID === session.user.userID)
      if (!isAdmin) {
        return failure(event, 403, "Election not published") as any
      }
    }

    const election = (await PrismaClient.election.findUnique({
      where: {
        id: electionID,
      },
      select,
    }))!

    return callback({ ...event, election })
  }
}

export const requireElectionAdmin = <T extends RequestEvent, R, S extends Prisma.ElectionSelect>(
  select: S,
  callback: (event: T & { userID: string; election: Prisma.ElectionGetPayload<{ select: S }> }) => Promise<R> | R
): ((event: T) => ExcludeFailure<R>) => {
  return requireAuth(async (event: T & { userID: string }) => {
    const electionID = Number(event.params.electionID)

    const electionExists = await PrismaClient.election.exists({
      id: electionID,
    })

    if (!electionExists) {
      return failure(event, 404, "Election not found")
    }

    const election = await PrismaClient.election.findUnique({
      where: {
        id: electionID,
        admins: {
          some: {
            userID: event.userID,
          },
        },
      },
      select,
    })

    if (!election) {
      return failure(event, 403, "You are not an admin of this Election")
    }

    return callback({ ...event, election })
  })
}

export const requireCandidate = <T extends RequestEvent, R, S extends Prisma.CandidateSelect>(
  select: S,
  callback: (event: T & { candidate: Prisma.CandidateGetPayload<{ select: S }> }) => Promise<R> | R
): ((event: T) => ExcludeFailure<R>) => {
  return async (event: T) => {
    const candidateID = Number(event.params.candidateID)

    const candidate = await PrismaClient.candidate.findUnique({
      where: {
        id: candidateID,
      },
      select,
    })

    if (!candidate) {
      return failure(event, 404, "Candidate not found") as any
    }

    return callback({ ...event, candidate })
  }
}

export const requireCandidateAdmin = <T extends RequestEvent, R, S extends Prisma.CandidateSelect>(
  select: S,
  callback: (event: T & { userID: string; candidate: Prisma.CandidateGetPayload<{ select: S }> }) => Promise<R> | R
): ((event: T) => ExcludeFailure<R>) => {
  return requireAuth(async (event: T & { userID: string }) => {
    const candidateID = Number(event.params.candidateID)

    const candidateExists = await PrismaClient.candidate.exists({
      id: candidateID,
    })

    if (!candidateExists) {
      return failure(event, 404, "Candidate not found")
    }

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

    if (!candidate) {
      return failure(event, 403, "You are not an admin of this candidate")
    }

    return callback({ ...event, candidate })
  })
}

export const requireMotion = <T extends RequestEvent, R, S extends Prisma.MotionSelect>(
  select: S,
  callback: (event: T & { motion: Prisma.MotionGetPayload<{ select: S }> }) => Promise<R> | R
): ((event: T) => ExcludeFailure<R>) => {
  return async (event: T) => {
    const motionID = Number(event.params.motionID)

    const motion = await PrismaClient.motion.findUnique({
      where: {
        id: motionID,
      },
      select,
    })

    if (!motion) {
      return failure(event, 404, "Motion not found") as any
    }

    return callback({ ...event, motion })
  }
}

export const requireMotionAdmin = <T extends RequestEvent, R, S extends Prisma.MotionSelect>(
  select: S,
  callback: (event: T & { userID: string; motion: Prisma.MotionGetPayload<{ select: S }> }) => Promise<R> | R
): ((event: T) => ExcludeFailure<R>) => {
  return requireAuth(async (event: T & { userID: string }) => {
    const motionID = Number(event.params.motionID)

    const motionExists = await PrismaClient.motion.exists({
      id: motionID,
    })

    if (!motionExists) {
      return failure(event, 404, "Motion not found")
    }

    const motion = await PrismaClient.motion.findUnique({
      where: {
        id: motionID,
        proposer: {
          userID: event.userID,
        },
      },
      select,
    })

    if (!motion) {
      return failure(event, 403, "You are not the proposer of this Motion")
    }

    return callback({ ...event, motion })
  })
}