import { useAuth, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { styles } from "../../styles/auth.styles";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      {user?.imageUrl && (
        <Image
          source={{ uri: user.imageUrl }}
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
      )}
      <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: "600" }}>
        {user?.fullName || user?.username || "Your profile"}
      </Text>
      <Text style={{ color: COLORS.grey }}>
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
      <Pressable
        onPress={() => signOut()}
        style={{
          marginTop: 16,
          backgroundColor: COLORS.surface,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: COLORS.white, fontWeight: "600" }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
