import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { expectOwner, expectUser, getUser } from "./lib/authHelpers";

export const list = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);

    const owned =
      user &&
      (await ctx.db
        .query("whiteboards")
        .withIndex("by_owner", (q) => q.eq("owner", user._id))
        .collect());

    let discoverQuery = ctx.db
      .query("whiteboards")
      .withIndex("by_online")
      .order("desc");

    if (user) {
      discoverQuery = discoverQuery.filter((q) =>
        q.neq(q.field("owner"), user._id)
      );
    }
    const discover = await discoverQuery.take(12);

    return { owned: owned ?? undefined, discover };
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await expectUser(ctx);

    const whiteboards = await ctx.db
      .query("whiteboards")
      .withIndex("by_owner", (q) => q.eq("owner", user._id))
      .collect();

    if (whiteboards.length >= 3) {
      throw new ConvexError("Whiteboard maximum reached");
    }

    const whiteboardId = await ctx.db.insert("whiteboards", {
      owner: user._id,
      name,
      online: 1,
    });

    await ctx.db.patch(user._id, { whiteboard: whiteboardId });

    return whiteboardId;
  },
});

export const destroy = mutation({
  handler: async (ctx) => {
    const { whiteboard } = await expectOwner(ctx);

    const joined = await ctx.db
      .query("users")
      .withIndex("by_whiteboard", (q) => q.eq("whiteboard", whiteboard._id))
      .collect();

    for (const user of joined) {
      await ctx.db.patch(user._id, { whiteboard: undefined });
    }

    await ctx.db.delete(whiteboard._id);
  },
});

export const enter = mutation({
  args: { whiteboardId: v.string() },
  handler: async (ctx, args) => {
    const whiteboardId = ctx.db.normalizeId("whiteboards", args.whiteboardId);

    if (!whiteboardId) {
      throw new ConvexError("Whiteboard not found");
    }

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const whiteboard = await ctx.db.get(whiteboardId);

    if (!whiteboard) {
      throw new ConvexError("Whiteboard not found");
    }

    await ctx.db.patch(whiteboard._id, { online: whiteboard.online + 1 });
    await ctx.db.patch(userId, { whiteboard: whiteboardId });
  },
});

export const exit = mutation({
  handler: async (ctx) => {
    const user = await expectUser(ctx);

    if (!user.whiteboard) {
      throw new ConvexError("No whiteboard selected");
    }

    const whiteboard = await ctx.db.get(user.whiteboard);

    if (!whiteboard) {
      throw new ConvexError("Whiteboard not found");
    }

    await ctx.db.patch(whiteboard._id, { online: whiteboard.online - 1 });
    await ctx.db.patch(user._id, { whiteboard: undefined });
  },
});
