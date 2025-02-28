import { z } from "zod"

export const updateApiKeySchema = z.object({
  apiKey: z.string().refine((apiKey) => apiKey.length === 36, {
    message: "API Key must be 36 characters long",
  }),
})

export const emptySchema = z.object({})

export const editMemberSchema = z.object({
  userID: z.string().nonempty(),
})
