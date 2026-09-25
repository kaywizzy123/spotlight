import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from "./_generated/server";
import { getAuthenticatedUser } from "./users";

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

export const createStory = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    const storyId = await ctx.db.insert("stories", {
      userId: currentUser._id,
      storageId: args.storageId,
      imageUrl,
    });

    // stories disappear 24 hours after they're posted
    await ctx.scheduler.runAfter(
      STORY_LIFETIME_MS,
      internal.stories.expireStory,
      { storyId },
    );

    return storyId;
  },
});

// stories from you and the people you follow, grouped by user
export const getStoriesFeed = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", currentUser._id))
      .take(200);

    const userIds = [
      currentUser._id,
      ...follows.map((follow) => follow.followingId),
    ];

    const entries = await Promise.all(
      userIds.map(async (userId) => {
        const isOwn = userId === currentUser._id;

        // expired stories are deleted, so everything here is live; oldest first
        const stories = await ctx.db
          .query("stories")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .take(50);

        // only load profiles for people with something to show
        if (!isOwn && stories.length === 0) return null;
        const user = isOwn ? currentUser : await ctx.db.get("users", userId);
        if (!user) return null;

        const storiesWithSeen = await Promise.all(
          stories.map(async (story) => {
            const view = isOwn
              ? null
              : await ctx.db
                  .query("storyViews")
                  .withIndex("by_story_and_viewer", (q) =>
                    q.eq("storyId", story._id).eq("viewerId", currentUser._id),
                  )
                  .first();

            return {
              _id: story._id,
              _creationTime: story._creationTime,
              imageUrl: story.imageUrl,
              seen: isOwn || !!view,
            };
          }),
        );

        return {
          user: { _id: user._id, username: user.username, image: user.image },
          isOwn,
          stories: storiesWithSeen,
          hasUnseen: storiesWithSeen.some((story) => !story.seen),
          latest: stories.at(-1)?._creationTime ?? 0,
        };
      }),
    );

    const [own, ...others] = entries;

    // unseen first, then most recently posted
    const othersWithStories = others
      .filter((entry) => entry !== null)
      .sort(
        (a, b) =>
          Number(b.hasUnseen) - Number(a.hasUnseen) || b.latest - a.latest,
      );

    // your own bubble always shows, so you can add a story
    return own ? [own, ...othersWithStories] : othersWithStories;
  },
});

export const markStoryViewed = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const story = await ctx.db.get("stories", args.storyId);
    if (!story || story.userId === currentUser._id) return;

    const existing = await ctx.db
      .query("storyViews")
      .withIndex("by_story_and_viewer", (q) =>
        q.eq("storyId", args.storyId).eq("viewerId", currentUser._id),
      )
      .first();
    if (existing) return;

    await ctx.db.insert("storyViews", {
      storyId: args.storyId,
      viewerId: currentUser._id,
    });
  },
});

export const deleteStory = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const story = await ctx.db.get("stories", args.storyId);
    if (!story) return;
    if (story.userId !== currentUser._id) {
      throw new ConvexError("Not authorized to delete this story");
    }

    await removeStory(ctx, args.storyId);
  },
});

export const expireStory = internalMutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    await removeStory(ctx, args.storyId);
  },
});

// delete a story along with its views and image
async function removeStory(ctx: MutationCtx, storyId: Id<"stories">) {
  const story = await ctx.db.get("stories", storyId);
  if (!story) return;

  const views = await ctx.db
    .query("storyViews")
    .withIndex("by_story", (q) => q.eq("storyId", storyId))
    .collect();
  for (const view of views) {
    await ctx.db.delete("storyViews", view._id);
  }

  await ctx.storage.delete(story.storageId);
  await ctx.db.delete("stories", storyId);
}
