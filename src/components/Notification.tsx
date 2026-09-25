import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/notifications.styles";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Id } from "../../convex/_generated/dataModel";

type NotificationProps = {
  notification: {
    _id: Id<"notifications">;
    _creationTime: number;
    type: "like" | "comment" | "follow";
    sender: {
      _id?: Id<"users">;
      username?: string;
      image?: string;
    };
    post: {
      _id: Id<"posts">;
      imageUrl: string;
    } | null;
    comment: string | null;
  };
};

export default function Notification({ notification }: NotificationProps) {
  const openSenderProfile = () => {
    if (!notification.sender._id) return;
    router.push({
      pathname: "/user/[id]",
      params: { id: notification.sender._id },
    });
  };

  // like/comment open the post, follow opens the follower's profile
  const handlePress = () => {
    if (!notification.post) return openSenderProfile();
    router.push({
      pathname: "/post/[id]",
      params: {
        id: notification.post._id,
        showComments: notification.type === "comment" ? "true" : undefined,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.notificationItem} onPress={handlePress}>
      <View style={styles.notificationContent}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={openSenderProfile}
        >
          <Image
            source={notification.sender.image}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.iconBadge}>
            {notification.type === "like" ? (
              <Ionicons name="heart" size={14} color={COLORS.primary} />
            ) : notification.type === "follow" ? (
              <Ionicons name="person-add" size={14} color="#8B5CF6" />
            ) : (
              <Ionicons name="chatbubble" size={14} color="#3B82F6" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.notificationInfo}>
          <Text style={styles.username}>{notification.sender.username}</Text>
          <Text style={styles.action} numberOfLines={2}>
            {notification.type === "like"
              ? "liked your post"
              : notification.type === "follow"
                ? "started following you"
                : `commented: "${notification.comment}"`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatTimeAgo(notification._creationTime)}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Image
          source={notification.post.imageUrl}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      )}
    </TouchableOpacity>
  );
}
