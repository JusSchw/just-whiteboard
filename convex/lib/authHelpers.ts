import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function getUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);

  if (!userId) return null;

  const user = await ctx.db.get(userId);

  if (!user) return null;

  return user;
}

export async function expectUser(ctx: QueryCtx) {
  const user = await getUser(ctx);

  if (!user) {
    throw new ConvexError("Not authenticated");
  }

  return user;
}

export async function expectOwner(ctx: QueryCtx) {
  const user = await expectUser(ctx);

  if (!user.whiteboard) {
    throw new ConvexError("No whiteboard selected");
  }

  const whiteboard = await ctx.db.get(user.whiteboard);

  if (!whiteboard || whiteboard.owner !== user._id) {
    throw new ConvexError("Not Authorised");
  }

  return { user, whiteboard };
}
