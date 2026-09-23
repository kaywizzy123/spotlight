import { COLORS } from "@/constants/theme";
import { useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/auth.styles";

export default function Login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("OAuth error:", error);
    }
  };
  return (
    <View style={styles.container}>
      {/* BRAND SECTION */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <SymbolView
            name={{
              ios: "star.leadinghalf.filled",
              android: "star_half",
              web: "star_half",
            }}
            size={32}
            tintColor={COLORS.primary}
          />
        </View>
        <Text style={styles.title}>spotlight</Text>
        <Text style={styles.subtitle}>don&apos;t miss anything</Text>
        <Image
          source={require("@/assets/gifs/Login1.gif")}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>
      <TouchableOpacity
        style={styles.googleButton}
        activeOpacity={0.9}
        onPress={() => {
          handleGoogleSignIn();
        }}
      >
        <Ionicons name="logo-google" size={20} color={COLORS.background} />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      <Text style={styles.termsText}>
        By continuing, you agree to our{" "}
        <Text style={styles.termsLink}>Terms</Text> and{" "}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
    </View>
  );
}
