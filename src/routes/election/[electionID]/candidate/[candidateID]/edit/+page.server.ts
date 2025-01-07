import type { PageServerLoad } from "./$types"

import { Prisma } from "$lib/server/db"
import { isElectionAdmin } from "$lib/server/election"

import { message, superValidate, fail } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const editFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z
    .instanceof(File, { message: "Please upload an image" })
    .nullable()
    .refine((f) => f === null || f.size < 1024 * 1024 * 5, {
      message: "Image size must be less than 5MB",
    }),
})

export const load: PageServerLoad = async ({ parent }) => {
  const { candidate } = await parent()

  return {
    editForm: await superValidate(candidate, zod(editFormSchema)),
  }
}

export const actions = {}
