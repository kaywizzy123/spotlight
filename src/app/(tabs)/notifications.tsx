import { Loader } from "@/components/Loader";
import Notification from "@/components/Notification";
import { useTheme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { FlatList, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import { useNotificationStyles } from "../../styles/notifications.styles";

export default function Notifications() {
  const styles = useNotificationStyles();
  const notifications = useQuery(api.notifications.getNotifications);
  const markNotificationsSeen = useMutation(
    api.notifications.markNotificationsSeen,
  );

  // clear the tab dot while you're here, including for ones that arrive now
  const latestId = notifications?.[0]?._id;
  useFocusEffect(
    useCallback(() => {
      if (!latestId) return;
      markNotificationsSeen().catch((error) =>
        console.error("Error marking notifications seen:", error),
      );
    }, [latestId, markNotificationsSeen]),
  );

  if (notifications === undefined) return <Loader />;

  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={({ item }) => <Notification notification={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 60 }]}
      />
    </View>
  );
}

const NoNotificationsFound = () => {
  const colors = useTheme();
  const styles = useNotificationStyles();
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={colors.primary} />
      <Text style={{ fontSize: 20, color: colors.text, marginTop: 12 }}>
        No notifications yet
      </Text>
    </View>
  );
};
