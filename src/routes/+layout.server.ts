export const load = async ({ locals, cookies }) => {
  return {
    session: locals.session,
    bypass: cookies.get("bypass") === "true",
  }
}
