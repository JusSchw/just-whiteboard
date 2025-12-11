import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { expectUser } from "./lib/authHelpers";

export const get = query({
  handler: async (ctx) => {
    const user = await expectUser(ctx);

    if (user.whiteboard === undefined) {
      throw new ConvexError("Whiteboard not found");
    }

    return await ctx.db
      .query("cursors")
      .withIndex("by_whiteboard", (q) => q.eq("whiteboard", user.whiteboard!))
      .filter((q) => q.neq(q.field("userId"), user._id))
      .collect();
  },
});

export const update = mutation({
  args: { pos: v.optional(v.object({ x: v.number(), y: v.number() })) },

  handler: async (ctx, { pos }) => {
    const user = await expectUser(ctx);

    if (user.whiteboard === undefined) {
      throw new ConvexError("Whiteboard not found");
    }

    const cursor = await ctx.db
      .query("cursors")
      .withIndex("by_whiteboard_user", (q) =>
        q.eq("whiteboard", user.whiteboard!).eq("userId", user._id)
      )
      .unique();

    if (cursor) {
      await ctx.db.patch(cursor._id, { pos });
      return;
    }

    await ctx.db.insert("cursors", {
      userId: user._id,
      whiteboard: user.whiteboard,
      lastUpdated: Date.now(),
      pos,
    });
  },
});
