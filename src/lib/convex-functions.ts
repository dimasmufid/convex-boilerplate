import { makeFunctionReference } from "convex/server"

export type Viewer = {
  _id?: string
  name?: string
  email?: string
  role?: "user" | "admin"
  avatarUrl?: string | null
} | null

export type AdminUser = {
  _id: string
  name?: string
  email?: string
  role: "user" | "admin"
}

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

export const adminListUsersQuery = makeFunctionReference<
  "query",
  {
    search?: string
  },
  AdminUser[]
>("admin:listUsers")

export const adminSetUserRoleMutation = makeFunctionReference<
  "mutation",
  {
    userId: string
    role: "user" | "admin"
  },
  {
    ok: boolean
  }
>("admin:setUserRole")
