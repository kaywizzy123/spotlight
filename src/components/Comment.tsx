import { styles } from "@/styles/feed.styles";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { Image } from "expo-image";
import { Text, View } from "react-native";

type CommentProps = {
  comment: {
    content: string;
    _creationTime: number;
    user: {
      fullname?: string;
      image?: string;
    };
  };
};

export default function Comment({ comment }: CommentProps) {
  return (
    <View style={styles.commentContainer}>
      <Image
        source={comment.user.image}
        style={styles.commentAvatar}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatTimeAgo(comment._creationTime)}
        </Text>
      </View>
    </View>
  );
}
