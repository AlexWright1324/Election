import { type DefaultSession, SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"

declare module "@auth/sveltekit" {
	interface Session {
		user: {
			id: string
			groups: string[]
			uniID: string
		} & DefaultSession["user"]
	}
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [Keycloak],
	callbacks: {
		jwt({ token, profile }) {
			if (profile) {
				token.profile = {
					id: profile.sub,
					groups: profile.groups,
					uniID: profile.uni_id,
				}
			}
			return token
		},
		session({ session, token }) {
			if (token.profile) {
				session.user = { ...session.user, ...token.profile }
			}
			return session
		},
		signIn({ profile }) {
			// Ensure UniID exists in profile
			return profile ? "uni_id" in profile : false
		},
	},
})
