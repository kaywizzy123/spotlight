import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { styles } from "../../styles/profile.styles";

// a single post on its own, e.g. opened from a notification
export default function SinglePost() {
  const { id, showComments } = useLocalSearchParams<{
    id: string;
    showComments?: string;
  }>();

  const post = useQuery(api.posts.getPostById, {
    postId: id as Id<"posts">,
  });

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (post === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      {post === null ? (
        <View style={styles.noPostsContainer}>
          <Ionicons name="images-outline" size={48} color={COLORS.primary} />
          <Text style={styles.noPostsText}>
            This post is no longer available
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <Post
            post={post}
            onDeleted={handleBack}
            initialShowComments={showComments === "true"}
          />
        </ScrollView>
      )}
    </View>
  );
}
