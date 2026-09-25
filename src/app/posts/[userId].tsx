import PostsViewer from "@/components/PostsViewer";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function UserPosts() {
  const { userId, postId } = useLocalSearchParams<{
    userId: string;
    postId?: string;
  }>();

  const posts = useQuery(api.posts.getUserPostsWithInfo, {
    userId: userId as Id<"users">,
  });

  return <PostsViewer title="Posts" posts={posts} initialPostId={postId} />;
}
