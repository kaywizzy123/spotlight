import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import Story from "@/components/story";
import { useTheme } from "@/constants/theme";
import { uploadImage } from "@/utils/uploadImage";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../../convex/_generated/api";
import { useFeedStyles } from "../../styles/feed.styles";

export default function Index() {
  const colors = useTheme();
  const styles = useFeedStyles();
  const { signOut } = useAuth();

  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(api.posts.getFeedPosts, {}, { initialNumItems: 10 });

  if (status === "LoadingFirstPage") return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<StoriesSection />}
        ListEmptyComponent={<NoPostsFound />}
        // fetch the next page as you near the bottom
        onEndReached={() => {
          if (status === "CanLoadMore") loadMore(10);
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const StoriesSection = () => {
  const styles = useFeedStyles();
  const storiesFeed = useQuery(api.stories.getStoriesFeed);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createStory = useMutation(api.stories.createStory);
  const [isUploading, setIsUploading] = useState(false);

  const addStory = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (result.canceled) return;

    try {
      setIsUploading(true);
      const uploadUrl = await generateUploadUrl();
      const storageId = await uploadImage(result.assets[0].uri, uploadUrl);
      await createStory({ storageId });
    } catch (error) {
      console.error("Error adding story:", error);
      Alert.alert("Error", "Could not add your story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (storiesFeed === undefined) return null;

  return (
    <ScrollView
      horizontal
      style={styles.storiesContainer}
      showsHorizontalScrollIndicator={false}
    >
      {storiesFeed.map((entry) => (
        <Story
          key={entry.user._id}
          entry={entry}
          onPress={() =>
            router.push({
              pathname: "/stories/[userId]",
              params: { userId: entry.user._id },
            })
          }
          onAdd={entry.isOwn ? addStory : undefined}
          isUploading={entry.isOwn && isUploading}
        />
      ))}
    </ScrollView>
  );
};

const NoPostsFound = () => {
  const colors = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 80,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20, color: colors.primary }}>No posts yet</Text>
    </View>
  );
};
