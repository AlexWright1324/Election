import { superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"
import { z } from "zod"

const voteSchema = z.object({
  roles: z
    .object({
      id: z.number(),
      candidates: z
        .object({
          id: z.number(),
        })
        .array(),
    })
    .array(),
  motions: z
    .object({
      id: z.number(),
      vote: z.enum(["yes", "no", "abstain"]),
    })
    .array(),
})

export const load = async ({ parent }) => {
  // TODO: Check if able to vote

  return {
    voteForm: await superValidate(zod(voteSchema)),
  }
}
