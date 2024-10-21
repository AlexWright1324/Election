import { createReadStream } from "node:fs"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { constants, access, stat } from "node:fs/promises"
import { join } from "node:path"
import { error } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params, request }) => {
	const filePath = join("store", params.id, "files", params.path)

	const file = Bun.file(filePath)
	if (!(await file.exists())) {
		error(404, "File not found")
	}

	return new Response(file.stream())

	// biome-ignore lint/correctness/noUnreachable: <explanation>
	const range = request.headers.get("range")
	if (!range) {
		// Check if file is bigger than the max allowed size of 100MB
		if (file.size > 1024 * 1024 * 100) {
			error(400, "File too large")
		}
		return new Response(createReadStream(filePath) as unknown as BodyInit, {
			headers: {
				"Content-Length": file.size.toString(),
				"Content-Type": "application/octet-stream",
			},
		})
	}

	const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
	const start = Number.parseInt(startStr, 10)
	let end = endStr ? Number.parseInt(endStr, 10) : file.size - 1
	let chunkSize = end - start + 1
	const maxSize = 1024 * 1024 * 10
	if (chunkSize > maxSize) {
		end = start + maxSize - 1
		chunkSize = end - start + 1
	}

	const headers = {
		"Content-Range": `bytes ${start}-${end}/${file.size}`,
		"Accept-Ranges": "bytes",
		"Content-Length": chunkSize.toString(),
		"Content-Type": "application/octet-stream",
	}

	return new Response(
		createReadStream(filePath, { start, end }) as unknown as BodyInit,
		{
			headers,
			status: 206,
		},
	)
}
