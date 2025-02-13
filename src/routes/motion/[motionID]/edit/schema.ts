import { z } from "zod"

export const editFormSchema = z.object({
  name: z.string().nonempty("Name cannot be empty"),
  description: z.string(),
})
