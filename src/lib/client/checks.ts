export const UserCanCreateCandidate = (
  election: { nominationsStart: Date | null; nominationsEnd: Date | null },
  user: unknown | undefined,
  date: Date,
) => {
  return (
    election.nominationsStart &&
    election.nominationsEnd &&
    election.nominationsStart <= date &&
    election.nominationsEnd >= date &&
    user
  )
}

export const UserCanCreateMotion = (
  election: { nominationsStart: Date | null; nominationsEnd: Date | null; motionEnabled: boolean },
  user: unknown | undefined,
  date: Date,
) => {
  return (
    election.motionEnabled &&
    election.nominationsStart &&
    election.nominationsEnd &&
    election.nominationsStart <= date &&
    election.nominationsEnd >= date &&
    user
  )
}

export const UserCanEditCandidate = (
  candidate: { users: { userID: string }[]; role: { election: { start: Date | null } } },
  user: unknown | undefined,
  date: Date,
) => {
  return (
    candidate.users.some((u) => u.userID === user) &&
    candidate.role.election.start &&
    date < candidate.role.election.start &&
    user
  )
}

export const UserCanJoinCandidate = (
  candidate: {
    users: { userID: string }[]
    role: { election: { nominationsStart: Date | null; nominationsEnd: Date | null; candidateMaxUsers: number } }
  },
  user: unknown | undefined,
  date: Date,
) => {
  return (
    !candidate.users.some((u) => u.userID === user) &&
    candidate.role.election.candidateMaxUsers > candidate.users.length &&
    candidate.role.election.nominationsStart &&
    candidate.role.election.nominationsEnd &&
    candidate.role.election.nominationsStart <= date &&
    candidate.role.election.nominationsEnd >= date &&
    user
  )
}

export const UserCanEditMotion = (
  motion: { proposer: { userID: string }; election: { start: Date | null } },
  user: unknown | undefined,
  date: Date,
) => {
  return motion.proposer.userID === user && motion.election.start && date < motion.election.start
}

export const UserCanSecondMotion = (
  motion: {
    proposer: { userID: string }
    seconders: { userID: string }[]
    election: { start: Date | null; motionMaxSeconders: number }
  },
  user: unknown | undefined,
  date: Date,
) => {
  return (
    motion.proposer.userID !== user &&
    !motion.seconders.some((seconder) => seconder.userID === user) &&
    motion.election.motionMaxSeconders > motion.seconders.length &&
    motion.election.start &&
    date < motion.election.start &&
    user
  )
}
