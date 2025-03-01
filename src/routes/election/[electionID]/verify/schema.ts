import { z } from "zod"

export const signatureSchema = z.object({
  signature: z.string().nonempty(),
})
