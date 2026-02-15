import { makeFunctionReference } from "convex/server"

export type Viewer = {
  name?: string
  email?: string
  image?: string
  role?: "user" | "admin"
} | null

export const viewerQuery = makeFunctionReference<
  "query",
  Record<string, never>,
  Viewer
>("users:viewer")

export const updateProfileMutation = makeFunctionReference<
  "mutation",
  {
    name?: string
    image?: string
  },
  Viewer
>("users:updateProfile")
