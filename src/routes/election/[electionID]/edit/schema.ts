import { zImage } from "$lib/client/schema"

import { z } from "zod"

const timeToDay = 1000 * 60 * 60 * 24

export const updateSchema = z
  .object({
    name: z.string().min(2),
    description: z.string(),
    nominationsStart: z.coerce.date().nullable(),
    nominationsEnd: z.coerce.date().nullable(),
    start: z.coerce.date().nullable(),
    end: z.coerce.date().nullable(),
    published: z.boolean(),
    image: zImage,
    ronEnabled: z.boolean(),
    candidateDefaultDescription: z.string(),
    candidateMaxDescription: z.number().min(0),
    candidateMaxUsers: z.number().min(1),
    motionEnabled: z.boolean(),
    motionDefaultDescription: z.string().optional(),
    motionMaxDescription: z.number().min(0).optional(),
    motionMaxSeconders: z.number().min(1).optional(),
    membersOnly: z.boolean(),
  })
  .superRefine((data, ctx) => {
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

    // Can't publish if dates are not set
    if (data.published && !someSet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dates must be set to publish an election",
        path: ["published"],
      })
    }

    // Default description length respects max description length
    if (data.candidateDefaultDescription.length > data.candidateMaxDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Candidate default description length exceeds max description length",
        path: ["candidateDefaultDescription"],
      })
    }
    if (data.motionEnabled) {
      if (data.motionDefaultDescription === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Motion default description must be set if motions are enabled",
          path: ["motionDefaultDescription"],
        })
      }
      if (data.motionMaxDescription === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Motion max description must be set if motions are enabled",
          path: ["motionMaxDescription"],
        })
      }
      if (data.motionMaxSeconders === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Motion max seconders must be set if motions are enabled",
          path: ["motionMaxSeconders"],
        })
      }
    }

    if (
      data.motionDefaultDescription &&
      data.motionMaxDescription &&
      data.motionDefaultDescription.length > data.motionMaxDescription
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motion default description length exceeds max description length",
        path: ["motionDefaultDescription"],
      })
    }
  })
