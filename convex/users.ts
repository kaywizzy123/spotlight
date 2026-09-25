import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
  QueryCtx,
} from "./_generated/server";

// Create a user from a Clerk webhook event
export const createUser = internalMutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) return;

    //create a user in db
    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) throw new Error("User not found");

  return currentUser;
}

// Current signed-in user, or null if not signed in / not yet synced
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    username: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const username = args.username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(username)) {
      throw new ConvexError(
        "Username must be 3-30 characters: letters, numbers, periods or underscores",
      );
    }

    // usernames must be unique
    if (username !== currentUser.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();

      if (existing) throw new ConvexError("That username is already taken");
    }

    await ctx.db.patch("users", currentUser._id, {
      fullname: args.fullname,
      username,
      bio: args.bio,
    });
  },
});

export const getUserProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.id);
    if (!user) throw new Error("User not found");

    return user;
  },
});

export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId),
      )
      .first();

    return !!follow;
  },
});

export const toggleFollow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (currentUser._id === args.followingId) {
      throw new ConvexError("You can't follow yourself");
    }

    const target = await ctx.db.get("users", args.followingId);
    if (!target) throw new ConvexError("User not found");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId),
      )
      .first();

    if (existing) {
      // unfollow
      await ctx.db.delete("follows", existing._id);
      await ctx.db.patch("users", currentUser._id, {
        following: Math.max(0, currentUser.following - 1),
      });
      await ctx.db.patch("users", target._id, {
        followers: Math.max(0, target.followers - 1),
      });
      return false; // unfollowed
    }

    // follow
    await ctx.db.insert("follows", {
      followerId: currentUser._id,
      followingId: args.followingId,
    });
    await ctx.db.patch("users", currentUser._id, {
      following: currentUser.following + 1,
    });
    await ctx.db.patch("users", target._id, {
      followers: target.followers + 1,
    });
    await ctx.db.insert("notifications", {
      receiverId: target._id,
      senderId: currentUser._id,
      type: "follow",
    });
    return true; // followed
  },
});
