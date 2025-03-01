import type { ToastContext } from "@skeletonlabs/skeleton-svelte"
import { superForm as originalSuperForm, type SuperValidated } from "sveltekit-superforms"

export type Message = {
  status: "success" | "error"
  text: string
}

export const superForm = <
  T extends Record<string, unknown>,
  M extends Message = Message,
  In extends Record<string, unknown> = T,
>(
  toast: ToastContext,
  ...params: Parameters<typeof originalSuperForm<T, M, In>>
) => {
  return originalSuperForm<T, M, In>(params[0], {
    scrollToError: "smooth",
    validationMethod: "oninput",
    ...params[1],
    onUpdated: (event) => {
      event.form.errors._errors?.forEach((error) => {
        toast.create({
          title: "Error",
          type: "error",
          description: error,
        })
      })
      return params[1]?.onUpdated?.(event)
    },
    onError: (event) => {
      toast.create({
        title: "Error",
        type: "error",
        description: event.result.error.message,
      })
      if (params[1]?.onError == "apply") {
        return
      }
      return params[1]?.onError?.(event)
    },
    /*     onResult: (event) => {
      if (event.result.type === "failure") {
        // setError
        toast.create({
          title: "Error",
          type: "error",
          description: event.result.data?.form.errors._errors,
        })
      }
      return params[1]?.onResult?.(event)
    }, */
  })
}
