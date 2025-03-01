import { ElectionIsVisible, UserCanViewElection } from "$lib/client/checks"
import {
  isElectionAdmin,
  CandidateIsVisible,
  isCandidateAdmin,
  MotionIsVisible,
  isMotionAdmin,
  isElectionMember,
  canSignup,
} from "$lib/server/checks"
import { PrismaClient, type Prisma } from "$lib/server/db"

import { generateResults } from "./election"

import { SvelteKitAuth, type Session } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { error, fail, type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit"

declare module "@auth/sveltekit" {
  interface Session {
    user: {
      userID: string
      admin: boolean
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
    userID: string
    admin: boolean
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [Keycloak],
  callbacks: {
    // From Keycloak
    async jwt({ token, profile }) {
      if (!profile) return token

      token.admin = profile.groups.includes("exec")
      token.userID = profile.uni_id
      return token
    },
    async session({ session, token }) {
      session.user.userID = token.userID
      session.user.admin = token.admin

      return session as Session
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

    const electionData = await PrismaClient.election.findUnique({
      where: { id: electionID },
      select: {
        start: true,
        end: true,
        nominationsEnd: true,
        nominationsStart: true,
        admins: { select: { userID: true } },
        resultsPosted: true,
      },
    })

    if (!electionData) return handleFailure(event, 404, "Election not found")

    const canView = UserCanViewElection(electionData, event.locals.session?.user)
    if (!canView.allow) {
      return handleFailure(event, 404, "Election not found")
    }

    // Generate results if election is over and not posted
    if (!electionData.resultsPosted && electionData.end && electionData.end < new Date()) {
      const results = await generateResults(electionID)

      const roles = {
        updateMany: results.results.roles.map((role) => ({
          where: { id: role.id },
          data: {
            result: {
              droopQuota: role.droopQuota,
              winners: role.winners,
              rounds: role.rounds,
            } satisfies PrismaJson.RoleResult,
          },
        })),
      }

      const motions = {
        updateMany: results.results.motions.map((motion) => ({
          where: { id: motion.id },
          data: {
            results: {
              for: motion.results.for,
              against: motion.results.against,
              abstain: motion.results.abstain,
            } satisfies PrismaJson.MotionResult,
          },
        })),
      }

      await PrismaClient.election.update({
        where: { id: electionID },
        data: {
          roles,
          motions,
          resultsPosted: true,
        },
      })
    }

    const election = await PrismaClient.election.findUnique({
      where: { id: electionID },
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

    const election = await PrismaClient.election.findUnique({
      where: {
        id: electionID,
        AND: [isElectionAdmin(event.userID)],
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
        AND: [CandidateIsVisible(event.locals.session?.user.userID)],
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

    const candidate = await PrismaClient.candidate.findUnique({
      where: {
        id: candidateID,
        AND: [isCandidateAdmin(event.userID)],
      },
      select,
    })

    if (!candidate) return handleFailure(event, 403, "Candidate not found or you are not an admin")

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
        AND: [MotionIsVisible(event.locals.session?.user.userID)],
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

    const motion = await PrismaClient.motion.findUnique({
      where: {
        id: motionID,
        AND: [isMotionAdmin(event.userID)],
      },
      select,
    })

    if (!motion) return handleFailure(event, 403, "Motion not found or you are not an admin")

    return callback({ ...event, motion })
  })
}
