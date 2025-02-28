import { z } from "zod"

export const updateSchema = z
  .object({
    candidateDefaultDescription: z.string(),
    candidateMaxDescription: z.number().min(0),
    candidateMaxUsers: z.number().min(1),
  })
  .superRefine((data, ctx) => {
    // Default description length respects max description length
    if (data.candidateDefaultDescription.length > data.candidateMaxDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Candidate default description length exceeds max description length",
        path: ["candidateDefaultDescription"],
      })
    }
  })
