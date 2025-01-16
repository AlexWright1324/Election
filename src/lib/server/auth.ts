import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { PrismaClient } from "$lib/server/db"

declare module "@auth/sveltekit" {
  interface Session {
    user: {
      name: string
      email: string
      id: string
      groups: string[]
      uniID: string
    }
  }

  // From Keycloak
  interface Profile {
    groups: string[]
    uni_id: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    sub: string
    groups: string[]
    uni_id: string
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [Keycloak],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.groups = token.groups
      session.user.uniID = token.uni_id

      return session
    },
    async jwt({ token, profile }) {
      if (!profile) return token
      if (!profile.sub) return token

      token.sub = profile.sub
      token.groups = profile.groups
      token.uni_id = profile.uni_id
      return token
    },
    async signIn({ profile }) {
      if (!profile?.uni_id || !profile?.name) {
        // No UniID, cant sign in
        return false
      }

      // Find or create user
      const user = await PrismaClient.user.upsert({
        where: { uniID: profile.uni_id },
        update: {
          name: profile.name,
        },
        create: {
          uniID: profile.uni_id,
          name: profile.name,
        },
      })

      return true
    },
  },
})
