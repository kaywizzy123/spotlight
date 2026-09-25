import { Loader } from "@/components/Loader";
import { StoryEntry } from "@/components/story";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/stories.styles";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  GestureResponderEvent,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../convex/_generated/api";

const STORY_DURATION_MS = 5000;

// first unseen story, or the start if everything has been seen
const startIndexFor = (entry: StoryEntry) =>
  Math.max(
    0,
    entry.stories.findIndex((story) => !story.seen),
  );

export default function StoryViewer() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { width } = useWindowDimensions();

  const feed = useQuery(api.stories.getStoriesFeed);
  const markStoryViewed = useMutation(api.stories.markStoryViewed);
  const deleteStory = useMutation(api.stories.deleteStory);

  // the users to play through, fixed when the viewer opens so the order
  // doesn't shift as stories get marked seen
  const [queue, setQueue] = useState<string[] | null>(null);
  const [userIndex, setUserIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));
  const closedRef = useRef(false);

  if (feed && queue === null) {
    const withStories = feed.filter((entry) => entry.stories.length > 0);
    const start = withStories.findIndex((entry) => entry.user._id === userId);
    const entries = withStories.slice(Math.max(0, start));
    setQueue(entries.map((entry) => entry.user._id));
    if (entries[0]) setStoryIndex(startIndexFor(entries[0]));
  }

  const entry = feed?.find((e) => e.user._id === queue?.[userIndex]);
  // clamp in case a story was deleted or expired while watching
  const currentIndex = entry
    ? Math.min(storyIndex, entry.stories.length - 1)
    : 0;
  const story = entry?.stories[currentIndex];

  const close = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    progress.stopAnimation();
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  // move to another user in the queue, skipping anyone whose stories are gone
  const goToUser = (index: number, direction: 1 | -1) => {
    for (let i = index; i >= 0 && i < (queue?.length ?? 0); i += direction) {
      const next = feed?.find((e) => e.user._id === queue?.[i]);
      if (next && next.stories.length > 0) {
        progress.setValue(0);
        setUserIndex(i);
        setStoryIndex(startIndexFor(next));
        return;
      }
    }
    close();
  };

  const goNext = () => {
    if (!entry) return close();
    if (currentIndex < entry.stories.length - 1) {
      progress.setValue(0);
      setStoryIndex(currentIndex + 1);
    } else {
      goToUser(userIndex + 1, 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      progress.setValue(0);
      setStoryIndex(currentIndex - 1);
    } else if (userIndex > 0) {
      goToUser(userIndex - 1, -1);
    } else {
      // already at the very first story: restart it
      play(0);
    }
  };

  // run the progress bar from `from` (0-1) to the end, then advance
  const play = (from: number) => {
    progress.setValue(from);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS * (1 - from),
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) goNext();
    });
  };

  const pause = () => progress.stopAnimation();
  const resume = () => progress.stopAnimation((value) => play(value));

  const handleTap = (event: GestureResponderEvent) => {
    progress.stopAnimation();
    if (event.nativeEvent.locationX < width / 3) goPrev();
    else goNext();
  };

  const handleDelete = () => {
    if (!story) return;
    pause();
    Alert.alert("Delete story", "Are you sure you want to delete this story?", [
      { text: "Cancel", style: "cancel", onPress: resume },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // the viewer moves on by itself once the story drops out of the feed
            if (entry?.stories.length === 1) goToUser(userIndex + 1, 1);
            await deleteStory({ storyId: story._id });
          } catch (error) {
            console.error("Error deleting story:", error);
            Alert.alert("Error", "Could not delete story. Please try again.");
            resume();
          }
        },
      },
    ]);
  };

  // mark each story seen as it's shown
  const storyId = story?._id;
  const shouldMarkSeen = !!story && !story.seen;
  useEffect(() => {
    if (storyId && shouldMarkSeen) {
      markStoryViewed({ storyId }).catch((error) =>
        console.error("Error marking story viewed:", error),
      );
    }
  }, [storyId, shouldMarkSeen, markStoryViewed]);

  // load the next image in the background so it shows instantly
  const nextImageUrl = entry?.stories[currentIndex + 1]?.imageUrl;
  useEffect(() => {
    if (nextImageUrl) Image.prefetch(nextImageUrl);
  }, [nextImageUrl]);

  // nothing left to show (e.g. the last story expired)
  useEffect(() => {
    if (queue && !story) close();
  });

  if (!story || !entry) return <Loader />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          style={styles.pressArea}
          onPress={handleTap}
          onLongPress={() => {}}
          delayLongPress={200}
          onPressIn={pause}
          onPressOut={resume}
        >
          <Image
            key={story._id}
            source={story.imageUrl}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            // start the timer once the image is on screen
            onLoad={() => play(0)}
            onError={goNext}
          />
        </Pressable>

        {/* PROGRESS BARS */}
        <View style={styles.progressRow}>
          {entry.stories.map((s, i) => (
            <View key={s._id} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < currentIndex
                        ? "100%"
                        : i > currentIndex
                          ? "0%"
                          : progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerUser}
            onPress={() => {
              if (entry.isOwn) return;
              progress.stopAnimation();
              router.replace({
                pathname: "/user/[id]",
                params: { id: entry.user._id },
              });
            }}
          >
            <Image
              source={entry.user.image}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Text style={styles.username}>
              {entry.isOwn ? "Your story" : entry.user.username}
            </Text>
            <Text style={styles.timeAgo}>
              {formatTimeAgo(story._creationTime)}
            </Text>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {entry.isOwn && (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={close}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
