import { query } from "./_generated/server";
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
