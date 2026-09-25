import { Loader } from "@/components/Loader";
import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useProfileStyles } from "../../styles/profile.styles";

export default function UserProfile() {
  const colors = useTheme();
  const styles = useProfileStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = id as Id<"users">;

  const profile = useQuery(api.users.getUserProfile, { id: userId });
  const posts = useQuery(api.posts.getPostsByUser, { userId });
  const isFollowing = useQuery(api.users.isFollowing, { followingId: userId });
  const toggleFollow = useMutation(api.users.toggleFollow);

  const handleToggleFollow = async () => {
    try {
      await toggleFollow({ followingId: userId });
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (profile === undefined || posts === undefined || isFollowing === undefined)
    return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <View style={styles.profileInfo}>
            {/* AVATAR & STATS */}
            <View style={styles.avatarAndStats}>
              <View style={styles.avatarContainer}>
                <Image
                  source={profile.image}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.posts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            <Text style={styles.name}>{profile.fullname}</Text>
            {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={handleToggleFollow}
            >
              <Text
                style={
                  isFollowing
                    ? styles.followingButtonText
                    : styles.followButtonText
                }
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.noPostsContainer}>
            <Ionicons name="images-outline" size={48} color={colors.primary} />
            <Text style={styles.noPostsText}>No posts yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() =>
              router.push({
                pathname: "/posts/[userId]",
                params: { userId, postId: item._id },
              })
            }
          >
            <Image
              source={item.imageUrl}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
