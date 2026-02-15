import { getAuthUserId } from "@convex-dev/auth/server";
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const viewer = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    const avatarUrl = profile?.avatarStorageId
      ? await ctx.storage.getUrl(profile.avatarStorageId)
      : null;

    return {
      ...user,
      avatarUrl,
    };
  },
});

export const updateProfile = mutationGeneric({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      await ctx.db.patch(userId, {
        name: trimmedName || undefined,
      });
    }

    return await ctx.db.get(userId);
  },
});

export const generateAvatarUploadUrl = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated.");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const setAvatar = mutationGeneric({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.avatarStorageId && profile.avatarStorageId !== args.storageId) {
      await ctx.storage.delete(profile.avatarStorageId);
    }

    if (profile) {
      await ctx.db.patch(profile._id, {
        avatarStorageId: args.storageId,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        avatarStorageId: args.storageId,
      });
    }

    return { ok: true };
  },
});

export const removeAvatar = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated.");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile?.avatarStorageId) {
      return { ok: true };
    }

    await ctx.storage.delete(profile.avatarStorageId);
    await ctx.db.patch(profile._id, {
      avatarStorageId: undefined,
    });

    return { ok: true };
  },
});
