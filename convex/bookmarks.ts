import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const toggleBookmark = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId),
      )
      .first();

    if (existing) {
      //remove bookmark
      await ctx.db.delete("bookmarks", existing._id);
      return false; //unbookmarked
    }

    const post = await ctx.db.get("posts", args.postId);
    if (!post) throw new Error("Post not found");

    //add bookmark
    await ctx.db.insert("bookmarks", {
      userId: currentUser._id,
      postId: args.postId,
    });
    return true; // bookmarked
  },
});

export const getBookmarkedPosts = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // most recently bookmarked first, capped so the query stays bounded
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .take(100);

    const bookmarksWithInfo = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = await ctx.db.get("posts", bookmark.postId);
        return post;
      }),
    );

    // skip bookmarks whose post has since been deleted
    return bookmarksWithInfo.filter((post) => post !== null);
  },
});
