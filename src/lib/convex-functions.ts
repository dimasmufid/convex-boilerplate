import { makeFunctionReference } from "convex/server"

export type Viewer = {
  name?: string
  email?: string
  role?: "user" | "admin"
  avatarUrl?: string | null
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
  },
  Viewer
>("users:updateProfile")

export const generateAvatarUploadUrlMutation = makeFunctionReference<
  "mutation",
  Record<string, never>,
  string
>("users:generateAvatarUploadUrl")

export const setAvatarMutation = makeFunctionReference<
  "mutation",
  {
    storageId: string
  },
  {
    ok: boolean
  }
>("users:setAvatar")

export const removeAvatarMutation = makeFunctionReference<
  "mutation",
  Record<string, never>,
  {
    ok: boolean
  }
>("users:removeAvatar")
