import { fail } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ parent }) => {
    const { candidateAdmin } = await parent()
  
    if (!candidateAdmin) {
      return fail(403, { message: "You are not authorized to edit this candidate" })
    }
}