import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

const MAX_COMMENT_LENGTH = 500;

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const content = args.content.trim();
    if (!content) throw new Error("Comment cannot be empty");
    if (content.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
    }

    const post = await ctx.db.get("posts", args.postId);
    if (!post) throw new Error("Post not found");

    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      postId: args.postId,
      content,
    });

    // increment the post's comment count by 1
    await ctx.db.patch("posts", args.postId, { comments: post.comments + 1 });

    // if it's not user post, create a notification
    if (currentUser._id !== post.userId) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    // newest first, capped so the query stays bounded
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .take(100);

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get("users", comment.userId);
        return {
          ...comment,
          user: {
            fullname: user?.fullname,
            image: user?.image,
          },
        };
      }),
    );

    return commentsWithInfo;
  },
});
