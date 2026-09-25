import { useTheme } from "@/constants/theme";
import { ActivityIndicator, View } from "react-native";

export function Loader() {
  const colors = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
