import { Loader } from "@/components/Loader";
import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useFollowsStyles } from "../../styles/follows.styles";

type FollowTab = "followers" | "following";

type FollowUser = {
  _id: Id<"users">;
  username: string;
  fullname: string;
  image: string;
  isFollowing: boolean;
  isCurrentUser: boolean;
};

export default function Follows() {
  const colors = useTheme();
  const styles = useFollowsStyles();
  const params = useLocalSearchParams<{ userId: string; tab?: FollowTab }>();
  const userId = params.userId as Id<"users">;
  const [activeTab, setActiveTab] = useState<FollowTab>(
    params.tab === "following" ? "following" : "followers",
  );

  const profile = useQuery(api.users.getUserProfile, { id: userId });
  const { results, status, loadMore } = usePaginatedQuery(
    api.users.getFollowList,
    { userId, type: activeTab },
    { initialNumItems: 20 },
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (profile === undefined) return <Loader />;

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

      {/* TABS */}
      <View style={styles.tabs}>
        <TabButton
          label={`${profile.followers} ${profile.followers === 1 ? "follower" : "followers"}`}
          isActive={activeTab === "followers"}
          onPress={() => setActiveTab("followers")}
        />
        <TabButton
          label={`${profile.following} following`}
          isActive={activeTab === "following"}
          onPress={() => setActiveTab("following")}
        />
      </View>

      {status === "LoadingFirstPage" ? (
        <Loader />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <FollowRow user={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyList tab={activeTab} />}
          ListFooterComponent={
            status === "LoadingMore" ? (
              <ActivityIndicator
                style={styles.footerLoader}
                color={colors.primary}
              />
            ) : null
          }
          // fetch the next page as you near the bottom
          onEndReached={() => {
            if (status === "CanLoadMore") loadMore(20);
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

function TabButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const styles = useFollowsStyles();
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FollowRow({ user }: { user: FollowUser }) {
  const styles = useFollowsStyles();
  const toggleFollow = useMutation(api.users.toggleFollow);

  // your own row opens your profile tab instead of the public profile
  const openProfile = () => {
    if (user.isCurrentUser) router.push("/(tabs)/profile");
    else router.push({ pathname: "/user/[id]", params: { id: user._id } });
  };

  const handleToggleFollow = async () => {
    try {
      await toggleFollow({ followingId: user._id });
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.userRow} onPress={openProfile}>
      <Image
        source={user.image}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.userInfo}>
        <Text style={styles.username} numberOfLines={1}>
          {user.username}
        </Text>
        <Text style={styles.fullname} numberOfLines={1}>
          {user.fullname}
        </Text>
      </View>

      {!user.isCurrentUser && (
        <TouchableOpacity
          style={[
            styles.followButton,
            user.isFollowing && styles.followingButton,
          ]}
          onPress={handleToggleFollow}
        >
          <Text
            style={[
              styles.followButtonText,
              user.isFollowing && styles.followingButtonText,
            ]}
          >
            {user.isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function EmptyList({ tab }: { tab: FollowTab }) {
  const colors = useTheme();
  const styles = useFollowsStyles();
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color={colors.primary} />
      <Text style={styles.emptyText}>
        {tab === "followers" ? "No followers yet" : "Not following anyone yet"}
      </Text>
    </View>
  );
}
