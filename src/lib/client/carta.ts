import { Carta } from "carta-md"
import DOMPurify from "dompurify"

export const carta = new Carta({
  sanitizer: DOMPurify.sanitize,
})
