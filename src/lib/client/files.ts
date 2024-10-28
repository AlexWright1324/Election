import { join } from "node:path"
import sharp from "sharp"

const storagePath = "store"

export const upload = async (
	file: File | Buffer,
	filePath: string[],
): Promise<string> => {
	const path = join(storagePath, join(...filePath))
	await Bun.write(path, file)

	return path
}

export const uploadImage = async (
	file: File,
	filePath: string[],
): Promise<string> => {
	const original = await file.arrayBuffer()
	const image = await sharp(original)
		.resize(1000)
		.jpeg({ mozjpeg: true })
		.toBuffer()
	return upload(image, filePath)
}
