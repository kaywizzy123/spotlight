import PostsViewer from "@/components/PostsViewer";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../convex/_generated/api";

export default function SavedPosts() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();

  const posts = useQuery(api.bookmarks.getBookmarkedPostsWithInfo);

  return (
    <PostsViewer
      title="Saved"
      posts={posts}
      initialPostId={postId}
      keepRemoved
    />
  );
}
