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

    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutationGeneric({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
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

    const patch: {
      name?: string | undefined;
      image?: string | undefined;
    } = {};

    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      patch.name = trimmedName || undefined;
    }

    if (args.image !== undefined) {
      const trimmedImage = args.image.trim();
      patch.image = trimmedImage || undefined;
    }

    await ctx.db.patch(userId, patch);
    return await ctx.db.get(userId);
  },
});
