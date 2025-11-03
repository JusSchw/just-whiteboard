import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { expectOwner, expectUser } from "./lib/authHelpers";

export const createWhiteboard = mutation({
  handler: async (ctx) => {
    const user = await expectUser(ctx);

    const whiteboards = await ctx.db
      .query("whiteboards")
      .withIndex("owner", (q) => q.eq("owner", user._id))
      .collect();

    if (whiteboards.length >= 3) {
      throw new ConvexError("Whiteboard maximum reached");
    }

    const whiteboardId = await ctx.db.insert("whiteboards", {
      owner: user._id,
    });

    await ctx.db.patch(user._id, { whiteboard: whiteboardId });

    return whiteboardId;
  },
});

export const deleteWhiteboard = mutation({
  handler: async (ctx) => {
    const { whiteboard } = await expectOwner(ctx);

    const joined = await ctx.db
      .query("users")
      .withIndex("whiteboard", (q) => q.eq("whiteboard", whiteboard._id))
      .collect();

    await Promise.all(
      joined.map(
        async (u) => await ctx.db.patch(u._id, { whiteboard: undefined })
      )
    );

    await ctx.db.delete(whiteboard._id);
  },
});

export const enterWhiteboard = mutation({
  args: { whiteboardId: v.id("whiteboards") },
  handler: async (ctx, { whiteboardId }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const whiteboard = await ctx.db.get(whiteboardId);

    if (!whiteboard) {
      throw new ConvexError("Whiteboard not found.");
    }

    await ctx.db.patch(userId, { whiteboard: whiteboardId });

    return true;
  },
});

export const exitWhiteboard = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    await ctx.db.patch(userId, { whiteboard: undefined });
  },
});
