export const ElectionIsVisible = (election: {
  start: Date | null
  end: Date | null
  nominationsStart: Date | null
  nominationsEnd: Date | null
}) => {
  if (!election.start || !election.end || !election.nominationsStart || !election.nominationsEnd)
    return {
      error: "Election is not visible",
    }

  return {
    allow: true,
  }
}

export const UserIsElectionAdmin = (
  election: { admins: { userID: string }[] },
  user: { userID: string } | undefined,
) => {
  if (!election.admins.some((admin) => admin.userID === user?.userID)) {
    return {
      error: "You are not an admin",
    }
  }
  return {
    allow: true,
  }
}

export const UserCanViewElection = (
  election: Parameters<typeof UserIsElectionAdmin>[0] & Parameters<typeof ElectionIsVisible>[0],
  user: { userID: string } | undefined,
) => {
  const isAdmin = UserIsElectionAdmin(election, user)
  if (isAdmin.allow) {
    return isAdmin
  }
  return ElectionIsVisible(election)
}

export const UserCanVote = (
  election: { start: Date | null; end: Date | null; membersOnly: boolean; hasVoted: boolean; isMember: boolean },
  user: { userID: string } | undefined,
  date: Date,
) => {
  if (!user)
    return {
      error: "You must be logged in",
    }

  if (!election.start || !election.end)
    return {
      error: "Election is not open",
    }

  if (election.start > date)
    return {
      error: "Election has not started",
    }

  if (election.end < date)
    return {
      error: "Election has ended",
    }

  if (election.membersOnly && !election.isMember)
    return {
      error: "You are not a member",
    }

  if (election.hasVoted)
    return {
      error: "You have already voted",
    }

  return {
    allow: true,
  }
}

export const UserCanCreateElection = (user: { userID: string } | undefined) => {
  if (!user)
    return {
      error: "You must be logged in",
    }

  return {
    allow: true,
  }
}

export const UserCanCreateCandidate = (
  election: { nominationsStart: Date | null; nominationsEnd: Date | null },
  role: { candidates: { users: { userID: string }[] }[] },
  user: { userID: string } | undefined,
  date: Date,
) => {
  if (!user)
    return {
      error: "You must be logged in",
    }

  if (role.candidates.some((candidate) => candidate.users.some((u) => u.userID === user.userID)))
    return {
      error: "You are already a candidate",
    }

  if (!election.nominationsStart || !election.nominationsEnd)
    return {
      error: "Nominations are not open",
    }

  if (election.nominationsStart > date)
    return {
      error: "Nominations have not started",
    }

  if (election.nominationsEnd < date)
    return {
      error: "Nominations have ended",
    }

  return {
    allow: true,
  }
}

export const UserCanCreateMotion = (
  election: { nominationsStart: Date | null; nominationsEnd: Date | null; motionEnabled: boolean },
  user: unknown | undefined,
  date: Date,
) => {
  if (!user)
    return {
      error: "You must be logged in",
    }

  if (!election.motionEnabled)
    return {
      error: "Motions are not enabled",
    }

  if (!election.nominationsStart || !election.nominationsEnd)
    return {
      error: "Nominations are not open",
    }

  if (election.nominationsStart > date)
    return {
      error: "Nominations have not started",
    }

  if (election.nominationsEnd < date)
    return {
      error: "Nominations have ended",
    }

  return {
    allow: true,
  }
}

export const UserCanEditCandidate = (
  candidate: { users: { userID: string }[]; role: { election: { start: Date | null } } },
  user: unknown | undefined,
  date: Date,
) => {
  if (!user)
    return {
      error: "You must be logged in",
    }

  if (!candidate.users.some((u) => u.userID === user))
    return {
      error: "You are not a candidate",
    }

  if (!candidate.role.election.start || candidate.role.election.start < date)
    return {
      error: "Election has started",
    }

  return {
    allow: true,
  }
}

export const UserCanLeaveCandidate = (
  candidate: { users: { userID: string }[]; role: { election: { start: Date | null } } },
  user: unknown | undefined,
  date: Date,
) => {
  return UserCanEditCandidate(candidate, user, date)
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
  user: { userID: string } | undefined,
  date: Date,
) => {
  if (!user)
    return {
      error: "You must be logged in",
    }

  if (motion.proposer.userID === user.userID)
    return {
      error: "You can't second your own motion",
    }

  if (motion.seconders.some((seconder) => seconder.userID === user.userID))
    return {
      error: "You have already seconded this motion",
    }

  if (!motion.election.start || motion.election.start < date)
    return {
      error: "Election has started",
    }

  if (motion.election.motionMaxSeconders <= motion.seconders.length)
    return {
      error: "Maximum seconders reached",
    }

  return {
    allow: true,
  }
}

export const UserCanRequestSecondMotion = (
  motion: Parameters<typeof UserCanSecondMotion>[0] & { requested: boolean },
  user: Parameters<typeof UserCanSecondMotion>[1],
  date: Date,
) => {
  const canSecond = UserCanSecondMotion(motion, user, date)
  if (!canSecond.allow) {
    if (motion.requested)
      return {
        error: "You have already requested to second this motion",
      }
    return {
      error: canSecond.error,
    }
  }
  return {
    allow: true,
  }
}
