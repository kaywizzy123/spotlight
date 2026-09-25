import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    //createPost

    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // increment user's post count by 1

    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

// attach author info and the current user's like/bookmark state to a post
export async function withPostInfo(
  ctx: QueryCtx,
  post: Doc<"posts">,
  currentUserId: Id<"users">,
) {
  const postAuthor = (await ctx.db.get("users", post.userId))!;

  const like = await ctx.db
    .query("likes")
    .withIndex("by_user_and_post", (q) =>
      q.eq("userId", currentUserId).eq("postId", post._id),
    )
    .first();

  const bookmark = await ctx.db
    .query("bookmarks")
    .withIndex("by_user_and_post", (q) =>
      q.eq("userId", currentUserId).eq("postId", post._id),
    )
    .first();

  return {
    ...post,
    author: {
      _id: postAuthor?._id,
      username: postAuthor?.username,
      image: postAuthor?.image,
    },
    isLiked: !!like,
    isBookmarked: !!bookmark,
  };
}

// newest posts first, a page at a time
export const getFeedPosts = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const result = await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);

    //enhance posts with userdata and interaction
    const page = await Promise.all(
      result.page.map((post) => withPostInfo(ctx, post, currentUser._id)),
    );

    return { ...result, page };
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId),
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      //remove like
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false; //unliked
    } else {
      //add like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      // if it's not user post, create a notification
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }
      return true; // liked
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get("posts", args.postId);
    if (!post) throw new Error("Post not found");

    // only the owner can delete their post
    if (post.userId !== currentUser._id) {
      throw new Error("Not authorized to delete this post");
    }

    // delete associated likes
    for await (const like of ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))) {
      await ctx.db.delete("likes", like._id);
    }

    // delete associated comments
    for await (const comment of ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))) {
      await ctx.db.delete("comments", comment._id);
    }

    // delete associated bookmarks
    for await (const bookmark of ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))) {
      await ctx.db.delete("bookmarks", bookmark._id);
    }

    // delete associated notifications
    for await (const notification of ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))) {
      await ctx.db.delete("notifications", notification._id);
    }

    // delete the image from storage
    await ctx.storage.delete(post.storageId);

    // delete the post
    await ctx.db.delete("posts", args.postId);

    // decrement user's post count by 1
    await ctx.db.patch("users", currentUser._id, {
      posts: Math.max(0, currentUser.posts - 1),
    });
  },
});

export const getPostsByUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const user = args.userId
      ? await ctx.db.get("users", args.userId)
      : await getAuthenticatedUser(ctx);

    if (!user) throw new Error("User not found");

    return await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
  },
});

// a user's posts with full info, for the scrollable posts view
export const getUserPostsWithInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100);

    return await Promise.all(
      posts.map((post) => withPostInfo(ctx, post, currentUser._id)),
    );
  },
});

// a single post with full info, or null if it has been deleted
export const getPostById = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get("posts", args.postId);
    if (!post) return null;

    return await withPostInfo(ctx, post, currentUser._id);
  },
});

const MAX_CAPTION_LENGTH = 2200;

export const updateCaption = mutation({
  args: { postId: v.id("posts"), caption: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get("posts", args.postId);
    if (!post) throw new ConvexError("Post not found");

    // only the owner can edit their post
    if (post.userId !== currentUser._id) {
      throw new ConvexError("Not authorized to edit this post");
    }

    const caption = args.caption.trim();
    if (caption.length > MAX_CAPTION_LENGTH) {
      throw new ConvexError(
        `Captions can be at most ${MAX_CAPTION_LENGTH} characters`,
      );
    }

    await ctx.db.patch("posts", args.postId, {
      caption: caption || undefined,
    });
  },
});
