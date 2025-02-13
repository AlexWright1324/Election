import { requireElection } from "$lib/server/auth"

import { error } from "@sveltejs/kit"

export const load = requireElection(
  {
    id: true,
    name: true,
    description: true,
    motionEnabled: true,
    published: true,
    start: true,
    end: true,
    motions: {
      select: {
        id: true,
        name: true,
      },
    },
    admins: {
      select: {
        userID: true,
        name: true,
      },
    },
    roles: {
      select: {
        id: true,
        name: true,
        candidates: {
          select: {
            id: true,
            users: {
              select: {
                userID: true,
                name: true,
              },
            },
          },
        },
      },
    },
  },
  async ({ election }) => {
    return {
      election,
    }
  },
)
