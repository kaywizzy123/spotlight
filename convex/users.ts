import { paginationOptsValidator } from "convex/server";
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

// a user's followers or the people they follow, newest first, a page at a time
export const getFollowList = query({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("followers"), v.literal("following")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const result =
      args.type === "followers"
        ? await ctx.db
            .query("follows")
            .withIndex("by_following", (q) => q.eq("followingId", args.userId))
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("follows")
            .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
            .order("desc")
            .paginate(args.paginationOpts);

    const users = await Promise.all(
      result.page.map(async (follow) => {
        const userId =
          args.type === "followers" ? follow.followerId : follow.followingId;
        const user = await ctx.db.get("users", userId);
        if (!user) return null;

        // whether the viewer follows this person, for the row's button
        const viewerFollow = await ctx.db
          .query("follows")
          .withIndex("by_both", (q) =>
            q.eq("followerId", currentUser._id).eq("followingId", user._id),
          )
          .first();

        return {
          _id: user._id,
          username: user.username,
          fullname: user.fullname,
          image: user.image,
          isFollowing: !!viewerFollow,
          isCurrentUser: user._id === currentUser._id,
        };
      }),
    );

    return {
      ...result,
      page: users.filter((user) => user !== null),
    };
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

      // remove the follow notification so re-following doesn't stack duplicates
      const followNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_receiver_and_sender_and_type", (q) =>
          q
            .eq("receiverId", target._id)
            .eq("senderId", currentUser._id)
            .eq("type", "follow"),
        )
        .take(100);
      for (const notification of followNotifications) {
        await ctx.db.delete("notifications", notification._id);
      }

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
