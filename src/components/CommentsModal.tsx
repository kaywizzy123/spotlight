import Comment from "@/components/Comment";
import { Loader } from "@/components/Loader";
import { useTheme } from "@/constants/theme";
import { useFeedStyles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type CommentsModalProps = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
};

export default function CommentsModal({
  postId,
  visible,
  onClose,
}: CommentsModalProps) {
  const colors = useTheme();
  const styles = useFeedStyles();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // only subscribe to comments while the modal is open
  const comments = useQuery(
    api.comments.getComments,
    visible ? { postId } : "skip",
  );
  const addComment = useMutation(api.comments.addComment);

  const canPost = newComment.trim().length > 0 && !isSubmitting;

  const handleAddComment = async () => {
    if (!canPost) return;

    setIsSubmitting(true);
    try {
      await addComment({ postId, content: newComment });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        {/* HEADER */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* COMMENTS */}
        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={{ flexGrow: 1 }}
            style={styles.commentsList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={[styles.commentsList, styles.centered]}>
                <Text style={{ color: colors.grey }}>
                  No comments yet. Start the conversation.
                </Text>
              </View>
            }
          />
        )}

        {/* INPUT */}
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.grey}
            value={newComment}
            onChangeText={(text) => setNewComment(text.slice(0, 500))}
            multiline
          />
          <TouchableOpacity onPress={handleAddComment} disabled={!canPost}>
            <Text
              style={[styles.postButton, !canPost && styles.postButtonDisabled]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
