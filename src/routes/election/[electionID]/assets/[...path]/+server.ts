import { join, parse } from "node:path"
import PlaceHolderImage from "$lib/images/placeholder.png"
import { error, redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { storePath } from "$lib/server/store"

export const GET: RequestHandler = async ({ params }) => {
	const filePath = join(storePath, "elections", params.electionID, params.path)

	const file = Bun.file(filePath)
	if (!(await file.exists())) {
		const extension = parse(filePath).ext
		switch (extension) {
			case ".jpg":
			case ".jpeg":
			case ".png":
				return redirect(307, PlaceHolderImage)
		}
		error(404, "File not found")
	}

	return new Response(file.stream())
}
