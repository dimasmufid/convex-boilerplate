import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  userProfiles: defineTable({
    userId: v.id("users"),
    avatarStorageId: v.optional(v.id("_storage")),
  }).index("userId", ["userId"]),
});
