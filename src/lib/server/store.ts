import { join } from "node:path"
import sharp from "sharp"
import { coverImageName } from "$lib/client/store"
import { z } from "zod"

export const storePath = "store"
export const electionPath = "election"
export const candidatePath = "candidate"
export const competitionPath = "competition"

export const zImage = z
  .instanceof(File, { message: "Please upload an image" })
  .nullable()
  .refine((f) => f === null || f.size < 1024 * 1024 * 5, {
    message: "Image size must be less than 5MB",
  })

export const storeElectionCoverImage = async (electionID: number, file: File) => {
  const filePath = join(storePath, electionPath, electionID.toString(), coverImageName)
  return await storeImage(file, filePath)
}

export const storeCandidateCoverImage = async (electionID: number, candidateID: number, file: File) => {
  const filePath = join(
    storePath,
    electionPath,
    electionID.toString(),
    candidatePath,
    candidateID.toString(),
    coverImageName
  )
  return await storeImage(file, filePath)
}

const storeImage = async (file: File, filePath: string): Promise<string> => {
  const originalImage = await file.arrayBuffer()

  // Preprocessing
  const image = await sharp(originalImage).resize(1000).jpeg({ mozjpeg: true }).toBuffer()

  // Directories created automatically
  await Bun.write(filePath, image).catch(console.error)
  return filePath
}
