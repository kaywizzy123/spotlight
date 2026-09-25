import { makeStyles } from "@/constants/theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const useFeedStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: "JetBrainsMono-Medium",
      color: colors.primary,
    },
    storiesContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    storyWrapper: {
      alignItems: "center",
      marginHorizontal: 8,
      width: 72,
    },
    storyRing: {
      width: 68,
      height: 68,
      borderRadius: 34,
      padding: 2,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: 4,
    },
    noStory: {
      borderColor: "transparent",
    },
    seenStory: {
      borderColor: colors.grey,
    },
    storyUploading: {
      ...StyleSheet.absoluteFill,
      margin: 2,
      borderRadius: 30,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    addStoryBadge: {
      position: "absolute",
      right: -4,
      bottom: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    storyAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: colors.background,
    },
    storyUsername: {
      fontSize: 11,
      color: colors.text,
      textAlign: "center",
    },
    post: {
      marginBottom: 16,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
    },
    postHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    postAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    postUsername: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    postImage: {
      width: width,
      height: width,
    },
    postActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    postActionsLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    postInfo: {
      paddingHorizontal: 12,
    },
    likesText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    captionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 6,
    },
    captionUsername: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginRight: 6,
    },
    captionText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    commentsText: {
      fontSize: 14,
      color: colors.grey,
      marginBottom: 4,
    },
    timeAgo: {
      fontSize: 12,
      color: colors.grey,
      marginBottom: 8,
    },
    modalContainer: {
      backgroundColor: colors.background,
      marginBottom: Platform.OS === "ios" ? 44 : 0,
      flex: 1,
      marginTop: Platform.OS === "ios" ? 44 : 0,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      height: 56,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.surface,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    commentsList: {
      flex: 1,
    },
    commentContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.surface,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
    },
    commentContent: {
      flex: 1,
    },
    commentUsername: {
      color: colors.text,
      fontWeight: "500",
      marginBottom: 4,
    },
    commentText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    commentTime: {
      color: colors.grey,
      fontSize: 12,
      marginTop: 4,
    },
    commentInput: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 0.5,
      borderTopColor: colors.surface,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      color: colors.text,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 12,
      backgroundColor: colors.surface,
      borderRadius: 20,
      fontSize: 14,
    },
    postButton: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    postButtonDisabled: {
      opacity: 0.5,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
  }),
);
