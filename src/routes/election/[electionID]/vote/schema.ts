import { MotionVoteType } from "@prisma/client"
import { z } from "zod"

const roleBase = z.object({
  id: z.number(),
})

const motionBase = z.object({
  id: z.string(),
})

export const clientVoteSchema = z.object({
  roles: z.array(
    roleBase.extend({
      candidates: z.array(z.object({})),
    }),
  ),
  motions: z.array(motionBase),
})

export const motionVote = [
  [MotionVoteType.FOR, "For"],
  [MotionVoteType.AGAINST, "Against"],
  [MotionVoteType.ABSTAIN, "Abstain"],
] as const

export const serverVoteSchema = z.object({
  roles: z.array(
    roleBase.extend({
      candidates: z.array(z.object({ id: z.string() })).min(1, "Please vote for atleast one candidate"),
    }),
  ),
  motions: z.array(
    motionBase.extend({
      vote: z.nativeEnum(MotionVoteType, {
        required_error: "Please select a vote",
      }),
    }),
  ),
})
