import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const adminId = await getAuthUserId(ctx);
  if (!adminId) {
    throw new Error("Not authenticated.");
  }

  const admin = await ctx.db.get(adminId);
  if (!admin || admin.role !== "admin") {
    throw new Error("Admin permissions required.");
  }

  return { adminId };
}

export const listUsers = queryGeneric({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const search = args.search?.trim().toLowerCase();
    const users = await ctx.db.query("users").order("desc").collect();

    return users
      .filter((user) => {
        if (!search) {
          return true;
        }

        const haystack = `${user.name ?? ""} ${user.email ?? ""}`.toLowerCase();
        return haystack.includes(search);
      })
      .map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role === "admin" ? "admin" : "user",
      }));
  },
});

export const setUserRole = mutationGeneric({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const { adminId } = await requireAdmin(ctx);
    if (adminId === args.userId && args.role !== "admin") {
      throw new Error("You cannot remove your own admin role.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return { ok: true };
  },
});
