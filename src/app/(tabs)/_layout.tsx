import { useTheme } from "@/constants/theme";
import { useQuery } from "convex/react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { api } from "../../../convex/_generated/api";

export default function TabLayout() {
  const colors = useTheme();
  const hasUnreadNotifications = useQuery(
    api.notifications.hasUnreadNotifications,
  );

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.primary}
      badgeBackgroundColor={colors.primary}
      iconColor={{ default: colors.grey, selected: colors.primary }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookmarks">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon sf="bookmark.fill" md="bookmark" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon sf="heart.fill" md="favorite" />
        {/* dot when something new arrived since you last looked */}
        <NativeTabs.Trigger.Badge hidden={!hasUnreadNotifications} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          sf="person.crop.circle.fill"
          md="account_circle"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
