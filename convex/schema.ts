import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    whiteboard: v.optional(v.id("whiteboards")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_whiteboard", ["whiteboard"]),

  whiteboards: defineTable({
    owner: v.id("users"),
    name: v.string(),
    online: v.number(),
  })
    .index("by_owner", ["owner"])
    .index("by_online", ["online"]),

  cursors: defineTable({
    userId: v.id("users"),
    whiteboard: v.id("whiteboards"),

    pos: v.optional(v.object({ x: v.number(), y: v.number() })),

    lastUpdated: v.number(),
  })
    .index("by_whiteboard", ["whiteboard"])
    .index("by_user", ["userId"])
    .index("by_whiteboard_user", ["whiteboard", "userId"]),
});
