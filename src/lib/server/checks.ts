import type { Prisma } from "$lib/server/db"

export const isElectionAdmin = (userID: string | undefined): Prisma.ElectionWhereInput =>
  ({
    admins: {
      some: {
        userID: userID ?? "",
      },
    },
  }) as const

export const ElectionIsVisible = (userID: string | undefined): Prisma.ElectionWhereInput =>
  ({
    OR: [
      {
        start: {
          not: null,
        },
        end: {
          not: null,
        },
        nominationsStart: {
          not: null,
        },
        nominationsEnd: {
          not: null,
        },
      },
    ],
  }) as const

export const CandidateIsVisible = (userID: string | undefined): Prisma.CandidateWhereInput =>
  ({
    role: {
      election: ElectionIsVisible(userID),
    },
  }) as const

export const MotionIsVisible = (userID: string | undefined): Prisma.MotionWhereInput =>
  ({
    election: ElectionIsVisible(userID),
    OR: [
      {
        election: {
          motionEnabled: true,
        },
      },
      {
        election: isElectionAdmin(userID),
      },
    ],
  }) as const

export const isCandidateAdmin = (userID: string | undefined): Prisma.CandidateWhereInput =>
  ({
    users: {
      some: {
        userID: userID ?? "",
      },
    },
    AND: [CandidateIsVisible(userID)],
  }) as const

export const isMotionAdmin = (userID: string | undefined): Prisma.MotionWhereInput =>
  ({
    proposer: {
      userID: userID ?? "",
    },
    AND: [MotionIsVisible(userID)],
  }) as const

export const isElectionMember = (userID: string | undefined): Prisma.ElectionWhereInput =>
  ({
    OR: [
      {
        membersOnly: false,
      },
      {
        members: {
          some: {
            userID: userID ?? "",
          },
        },
      },
    ],
  }) as const

export const canSignup = (userID: string | undefined): Prisma.ElectionWhereInput =>
  ({
    AND: [
      ElectionIsVisible(userID),
      isElectionMember(userID),
      {
        nominationsStart: {
          lte: new Date(),
        },
        nominationsEnd: {
          gte: new Date(),
        },
      },
    ],
  }) as const

export const canVote = (userID: string): Prisma.ElectionWhereInput =>
  ({
    AND: [
      ElectionIsVisible(userID),
      isElectionMember(userID),
      {
        voters: {
          none: {
            userID,
          },
        },
        start: {
          lte: new Date(),
        },
        end: {
          gte: new Date(),
        },
      },
    ],
  }) as const

export const isElectionOngoing = (election: { start: Date | null; end: Date | null }) => {
  const now = new Date()
  return election.start !== null && election.end !== null && now >= election.start && now <= election.end
}
