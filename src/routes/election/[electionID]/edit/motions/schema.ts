import { z } from "zod"

export const updateSchema = z
  .object({
    motionMaxSeconders: z.number().min(1),
    motionMaxDescription: z.number().min(0),
    motionDefaultDescription: z.string(),
  })
  .superRefine((data, ctx) => {
    // Default description length respects max description length
    if (data.motionDefaultDescription.length > data.motionMaxDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motion default description length exceeds max description length",
        path: ["motionDefaultDescription"],
      })
    }
  })
