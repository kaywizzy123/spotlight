import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // newest first, capped so the query stays bounded
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .take(100);

    const notificationsWithInfo = await Promise.all(
      notifications.map(async (notification) => {
        const sender = await ctx.db.get("users", notification.senderId);

        const post = notification.postId
          ? await ctx.db.get("posts", notification.postId)
          : null;

        const comment = notification.commentId
          ? await ctx.db.get("comments", notification.commentId)
          : null;

        return {
          ...notification,
          sender: {
            _id: sender?._id,
            username: sender?.username,
            image: sender?.image,
          },
          post: post ? { _id: post._id, imageUrl: post.imageUrl } : null,
          comment: comment?.content ?? null,
        };
      }),
    );

    return notificationsWithInfo;
  },
});

// true if a notification arrived since the user last opened notifications
export const hasUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return false;

    const latest = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .first();
    if (!latest) return false;

    return latest._creationTime > (currentUser.notificationsSeenAt ?? 0);
  },
});

export const markNotificationsSeen = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    await ctx.db.patch("users", currentUser._id, {
      notificationsSeenAt: Date.now(),
    });
  },
});
