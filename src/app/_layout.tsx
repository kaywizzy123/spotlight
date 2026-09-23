import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.",
  );
}

// Dev-only: set EXPO_PUBLIC_BYPASS_AUTH=true in .env to skip sign-in.
const BYPASS_AUTH = __DEV__ && process.env.EXPO_PUBLIC_BYPASS_AUTH === "true";

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded && !BYPASS_AUTH) return null;

  const signedIn = BYPASS_AUTH || !!isSignedIn;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <RootNavigator />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
