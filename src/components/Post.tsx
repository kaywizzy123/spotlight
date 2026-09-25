import CommentsModal from "@/components/CommentsModal";
import EditCaptionModal from "@/components/EditCaptionModal";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
  onDeleted?: () => void;
  initialShowComments?: boolean;
};
function Post({ post, onDeleted, initialShowComments = false }: PostProps) {
  // like/bookmark state comes live from the server; these only hold an
  // instant local answer while a tap is being saved
  const [pendingLike, setPendingLike] = useState<boolean | null>(null);
  const [pendingBookmark, setPendingBookmark] = useState<boolean | null>(null);
  const [showComments, setShowComments] = useState(initialShowComments);
  const [showEditCaption, setShowEditCaption] = useState(false);

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  const currentUser = useQuery(api.users.getCurrentUser);

  const [heartScale] = useState(() => new Animated.Value(0));
  const [heartOpacity] = useState(() => new Animated.Value(0));
  const lastTapRef = useRef(0);
  const likePendingRef = useRef(false);

  const isLiked = pendingLike ?? post.isLiked;
  const likesCount =
    post.likes +
    (pendingLike === null ? 0 : Number(pendingLike) - Number(post.isLiked));
  const isBookmarked = pendingBookmark ?? post.isBookmarked;

  const handleLike = async () => {
    // ignore taps while a like is in flight so they can't undo each other
    if (likePendingRef.current) return;
    likePendingRef.current = true;
    setPendingLike(!isLiked);
    try {
      await toggleLike({ postId: post._id });
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      // the server data has caught up (or the tap failed), so drop the guess
      setPendingLike(null);
      likePendingRef.current = false;
    }
  };

  const showHeart = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 250,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // double tap the image to like; it never unlikes, like Instagram
  const handleImagePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      showHeart();
      if (!isLiked) handleLike();
    } else {
      lastTapRef.current = now;
    }
  };

  const handleBookmark = async () => {
    if (pendingBookmark !== null) return;
    setPendingBookmark(!isBookmarked);
    try {
      await toggleBookmark({ postId: post._id });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setPendingBookmark(null);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost({ postId: post._id });
            onDeleted?.();
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert("Error", "Could not delete post. Please try again.");
          }
        },
      },
    ]);
  };

  // owner-only menu: edit caption or delete
  const handleOptions = () => {
    const editCaption = () => setShowEditCaption(true);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Edit caption", "Delete", "Cancel"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) editCaption();
          else if (index === 1) handleDelete();
        },
      );
    } else {
      Alert.alert("Post options", undefined, [
        { text: "Edit caption", onPress: editCaption },
        { text: "Delete", style: "destructive", onPress: handleDelete },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <View style={styles.post}>
      {/* POST HEADER */}
      <View style={styles.postHeader}>
        <Link
          href={
            post.author._id === currentUser?._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleOptions}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* IMAGE */}
      <Pressable onPress={handleImagePress}>
        <Image
          source={post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              alignItems: "center",
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <Ionicons name="heart" size={100} color={COLORS.white} />
        </Animated.View>
      </Pressable>

      {/* POST ACTIONS */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount === 1
            ? "1 like"
            : likesCount > 1
              ? `${likesCount.toLocaleString()} likes`
              : "Be the first to like"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>
              {post.comments === 1
                ? "View 1 comment"
                : `View all ${post.comments.toLocaleString()} comments`}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>{formatTimeAgo(post._creationTime)}</Text>
      </View>

      <EditCaptionModal
        postId={post._id}
        caption={post.caption}
        visible={showEditCaption}
        onClose={() => setShowEditCaption(false)}
      />

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}

// skip re-rendering posts whose data didn't change when a list refreshes.
// onDeleted is left out on purpose: callers pass a fresh arrow each render
// that always does the same thing.
export default memo(
  Post,
  (prev, next) =>
    prev.initialShowComments === next.initialShowComments &&
    JSON.stringify(prev.post) === JSON.stringify(next.post),
);
