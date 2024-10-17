import type { RequestHandler } from "./$types"
import { error } from "@sveltejs/kit"
import { createReadStream } from "node:fs"
import { constants, access, stat } from "node:fs/promises"
import { join } from "node:path"

export const GET: RequestHandler = async ({ params, request }) => {
	const filePath = join("store", params.id, "files", params.path)

	await access(filePath, constants.R_OK).catch(() => error(404, "File not found "))

	const fileStats = await stat(filePath).catch(() => error(404, "File not found "))

	const range = request.headers.get("range")
	if (!range) {
		// Check if file is bigger than the max allowed size of 100MB
		if (fileStats.size > 1024 * 1024 * 100) {
			error(400, "File too large")
		}
		return new Response(createReadStream(filePath) as unknown as BodyInit, {
			headers: {
				"Content-Length": fileStats.size.toString(),
				"Content-Type": "application/octet-stream"
			}
		})
	}

	const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
	const start = parseInt(startStr, 10)
	let end = endStr ? parseInt(endStr, 10) : fileStats.size - 1
	let chunkSize = end - start + 1
	const maxSize = 1024 * 1024 * 10
	if (chunkSize > maxSize) {
		end = start + maxSize - 1
		chunkSize = end - start + 1
	}

	const headers = {
		"Content-Range": `bytes ${start}-${end}/${fileStats.size}`,
		"Accept-Ranges": "bytes",
		"Content-Length": chunkSize.toString(),
		"Content-Type": "application/octet-stream"
	}

	return new Response(createReadStream(filePath, { start, end }) as unknown as BodyInit, {
		headers,
		status: 206
	})
}
