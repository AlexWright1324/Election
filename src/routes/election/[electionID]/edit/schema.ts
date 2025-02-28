import { zImage } from "$lib/client/schema"

import { z } from "zod"

const timeToDay = 1000 * 60 * 60 * 24

export const determineSchema = (time: Date, election: { start: Date | null; end: Date | null }, bypass?: boolean) => {
  if (bypass)
    return {
      schema: updateSchemaBypass,
    }

  if (election.start && election.end) {
    if (election.start < time) {
      if (election.end < time) {
        return {
          schema: updateSchemaEnded,
          status: "Election has ended",
        }
      }

      return {
        schema: updateSchemaRunning,
        status: "Election has started",
        ignore: ["start"],
      }
    }
  }

  return {
    schema: updateSchemaDefault,
  }
}

export const updateSchemaEnded = z.object({
  name: z.string().min(2),
  description: z.string(),
  image: zImage,
})

export const updateSchemaBypass = updateSchemaEnded.extend({
  nominationsStart: z.coerce.date().nullable(),
  nominationsEnd: z.coerce.date().nullable(),
  start: z.coerce.date().nullable(),
  end: z.coerce.date().nullable(),
  ronEnabled: z.boolean(),
  motionEnabled: z.boolean(),
  membersOnly: z.boolean(),
})

export const updateSchemaRunning = updateSchemaEnded
  .extend({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.start > data.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting End date must be after start date",
        path: ["end"],
      })
    }

    const votingDuration = (data.end.getTime() - data.start.getTime()) / timeToDay
    if (votingDuration < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting period must be at least 48 hours",
        path: ["end"],
      })
    }
  })

export const updateSchemaDefault = updateSchemaBypass.superRefine((data, ctx) => {
  // Dates must be set at the same time
  const dates = [data.nominationsStart, data.nominationsEnd, data.start, data.end]
  const someSet = dates.some(Boolean)
  if (someSet) {
    if (!data.nominationsStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominations start date must be set if any other date is set",
        path: ["nominationsStart"],
      })
    }
    if (!data.nominationsEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominations end date must be set if any other date is set",
        path: ["nominationsEnd"],
      })
    }
    if (!data.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting start date must be set if any other date is set",
        path: ["start"],
      })
    }
    if (!data.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting end date must be set any if other date is set",
        path: ["end"],
      })
    }
  }

  // Dates must be in order
  if (data.nominationsStart && data.nominationsEnd) {
    if (data.nominationsStart > data.nominationsEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominations start date must be before Nominations end date",
        path: ["nominationsStart"],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominations end date must be after Nominations start date",
        path: ["nominationsEnd"],
      })
    }
    const nominationsDuration = (data.nominationsEnd.getTime() - data.nominationsStart.getTime()) / timeToDay
    if (nominationsDuration < 7) {
      const paths = ["nominationsStart", "nominationsEnd"]
      paths.forEach((path) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nominations period must be at least 7 days",
          path: [path],
        })
      })
    }
  }
  if (data.nominationsEnd && data.start) {
    if (data.nominationsEnd > data.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nominations end date must be on or before start date",
        path: ["nominationsEnd"],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting start date must be on or after Nominations end date",
        path: ["start"],
      })
    }

    // No efforcement required here by SU
  }

  if (data.start && data.end) {
    if (data.start > data.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting Start date must be before end date",
        path: ["start"],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voting End date must be after start date",
        path: ["end"],
      })
    }
    const votingDuration = (data.end.getTime() - data.start.getTime()) / timeToDay
    if (votingDuration < 2) {
      const paths = ["start", "end"]
      paths.forEach((path) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Voting period must be at least 48 hours",
          path: [path],
        })
      })
    }
  }
})
