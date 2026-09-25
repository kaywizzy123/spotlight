import { FIXED } from "@/constants/theme";
import { useFeedStyles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { FunctionReturnType } from "convex/server";
import { Image } from "expo-image";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";

export type StoryEntry = FunctionReturnType<
  typeof api.stories.getStoriesFeed
>[number];

type StoryProps = {
  entry: StoryEntry;
  onPress: () => void;
  // own bubble only: the "+" badge for adding a story
  onAdd?: () => void;
  isUploading?: boolean;
};

export default function Story({
  entry,
  onPress,
  onAdd,
  isUploading = false,
}: StoryProps) {
  const styles = useFeedStyles();
  const hasStories = entry.stories.length > 0;

  return (
    <TouchableOpacity
      style={styles.storyWrapper}
      onPress={hasStories ? onPress : onAdd}
      disabled={isUploading}
    >
      <View
        style={[
          styles.storyRing,
          !hasStories && styles.noStory,
          hasStories && !entry.hasUnseen && styles.seenStory,
        ]}
      >
        <Image
          source={entry.user.image}
          style={styles.storyAvatar}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        {isUploading && (
          <View style={styles.storyUploading}>
            <ActivityIndicator color={FIXED.white} />
          </View>
        )}
        {onAdd && (
          <TouchableOpacity
            style={styles.addStoryBadge}
            onPress={onAdd}
            disabled={isUploading}
          >
            <Ionicons name="add" size={14} color={FIXED.white} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {entry.isOwn ? "Your story" : entry.user.username}
      </Text>
    </TouchableOpacity>
  );
}
