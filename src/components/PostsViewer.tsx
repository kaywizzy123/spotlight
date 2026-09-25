import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { FunctionReturnType } from "convex/server";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useProfileStyles } from "../styles/profile.styles";

type PostItem = FunctionReturnType<
  typeof api.posts.getUserPostsWithInfo
>[number];

type PostsViewerProps = {
  title: string;
  posts: PostItem[] | undefined;
  initialPostId?: string;
  // keep posts on screen after they drop out of `posts` (e.g. unbookmarked),
  // until the user leaves, like Instagram's saved view
  keepRemoved?: boolean;
};

// Instagram-style scrollable list of posts, opened at the post that was tapped
export default function PostsViewer({
  title,
  posts,
  initialPostId,
  keepRemoved = false,
}: PostsViewerProps) {
  const colors = useTheme();
  const styles = useProfileStyles();
  // start with the tapped post at the top, then add the earlier ones above it
  const [showEarlier, setShowEarlier] = useState(!initialPostId);
  const [kept, setKept] = useState(() => posts ?? []);
  const [prevPosts, setPrevPosts] = useState(posts);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // merge in fresh data, keeping the original order and any removed posts
  if (keepRemoved && posts !== prevPosts) {
    setPrevPosts(posts);
    if (posts) {
      const latest = new Map(posts.map((post) => [post._id, post]));
      // a kept post that dropped out was unbookmarked, so show it that way
      const merged = kept.map(
        (post) => latest.get(post._id) ?? { ...post, isBookmarked: false },
      );
      const keptIds = new Set(kept.map((post) => post._id));
      setKept([...merged, ...posts.filter((post) => !keptIds.has(post._id))]);
    }
  }

  // deleted posts always go, even when keepRemoved holds on to the rest
  const items =
    posts === undefined
      ? undefined
      : (keepRemoved ? kept : posts).filter(
          (post) => !deletedIds.has(post._id),
        );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  // leave the screen if the last post gets deleted
  useEffect(() => {
    if (items?.length === 0) handleBack();
  }, [items?.length]);

  if (items === undefined) return <Loader />;

  const startIndex = showEarlier
    ? 0
    : Math.max(
        0,
        items.findIndex((post) => post._id === initialPostId),
      );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={startIndex > 0 ? items.slice(startIndex) : items}
        renderItem={({ item }) => (
          <Post
            post={item}
            onDeleted={() =>
              setDeletedIds((prev) => new Set(prev).add(item._id))
            }
          />
        )}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        // keep the tapped post in place when the earlier posts are added
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onContentSizeChange={() => {
          if (!showEarlier) setShowEarlier(true);
        }}
      />
    </View>
  );
}
