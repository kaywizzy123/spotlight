// styles/follows.styles.ts
import { FIXED, makeStyles } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const useFollowsStyles = makeStyles((colors) =>
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
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    tabs: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: colors.surface,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: colors.text,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.grey,
    },
    activeTabText: {
      color: colors.text,
    },
    listContainer: {
      paddingVertical: 8,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: colors.surface,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
      marginRight: 12,
    },
    username: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    fullname: {
      fontSize: 14,
      color: colors.grey,
      marginTop: 2,
    },
    followButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 7,
      borderRadius: 8,
      minWidth: 100,
      alignItems: "center",
    },
    followingButton: {
      backgroundColor: colors.surface,
    },
    followButtonText: {
      color: FIXED.white,
      fontSize: 14,
      fontWeight: "600",
    },
    followingButtonText: {
      color: colors.text,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
      gap: 12,
    },
    emptyText: {
      color: colors.grey,
      fontSize: 16,
    },
    footerLoader: {
      paddingVertical: 16,
    },
  }),
);
