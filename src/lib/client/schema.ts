import { z } from "zod"

export const emptySchema = z.object({})

export const zImage = z
  .instanceof(File, { message: "Please upload an image" })
  .optional()
  .refine((f) => f === undefined || f.size < 1024 * 1024 * 5, {
    message: "Image size must be less than 5MB",
  })
