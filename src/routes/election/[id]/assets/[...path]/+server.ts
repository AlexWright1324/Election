import { join } from "node:path"
import { error } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params }) => {
	const filePath = join("store", "elections", params.id, params.path)

	const file = Bun.file(filePath)
	if (!(await file.exists())) {
		error(404, "File not found")
	}

	return new Response(file.stream())
}
