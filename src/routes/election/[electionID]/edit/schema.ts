import { zImage } from "$lib/client/schema"

import { z } from "zod"

export const updateSchema = z
  .object({
    name: z.string().min(2),
    description: z.string(),
    signUpEnd: z.coerce.date().nullable(),
    start: z.coerce.date().nullable(),
    end: z.coerce.date().nullable(),
    published: z.boolean(),
    image: zImage,
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
    // Start, sign-up and end dates must be set at the same time
    const dates = [data.start, data.signUpEnd, data.end]
    const someSet = dates.some((date) => date)
    if (!data.start && someSet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be set if any other date is set",
        path: ["start"],
      })
    }
    if (!data.signUpEnd && someSet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sign-up end date must be set if any other date is set",
        path: ["signUpEnd"],
      })
    }
    if (!data.end && someSet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be set any if other date is set",
        path: ["end"],
      })
    }

    // Dates must be in order
    if (data.start && data.signUpEnd && !(data.signUpEnd <= data.start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sign-up end date must be on or before start date",
        path: ["signUpEnd"],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be on or after sign-up end date",
        path: ["start"],
      })
    }

    if (data.start && data.end && !(data.start <= data.end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before end date",
        path: ["start"],
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["end"],
      })
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
