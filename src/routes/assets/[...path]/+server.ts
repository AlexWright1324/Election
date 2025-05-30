import PlaceHolderImage from "$lib/images/placeholder.png"
import { storePath } from "$lib/server/store"

import { error, redirect } from "@sveltejs/kit"
import { join, parse } from "node:path"

export const GET = async ({ params }) => {
  const filePath = join(storePath, params.path)

  const file = Bun.file(filePath)
  if (!(await file.exists())) {
    const extension = parse(filePath).ext
    switch (extension) {
      case ".png":
      case ".jpg":
      case ".jpeg":
        return redirect(307, PlaceHolderImage)
    }
    error(404, "File not found")
  }

  return new Response(file.stream())
}
