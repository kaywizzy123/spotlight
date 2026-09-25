import { StyleSheet } from "react-native";

import { makeStyles } from "@/constants/theme";

export const useAuthStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },
    brandSection: {
      alignItems: "center",
    },
    logoContainer: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primary + "28",
      borderRadius: 20,
      padding: 10,
      width: 60,
      height: 60,
      marginBottom: 15,
    },
    illustration: {
      width: 280,
      height: 280,
    },
    title: {
      color: colors.primary,
      fontSize: 34,
      fontWeight: "bold",
      textAlign: "center",
    },
    subtitle: {
      color: colors.grey,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 10,
    },
    actions: {
      width: "100%",
      gap: 12,
      marginTop: 24,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    googleButton: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: colors.text,
      paddingVertical: 16,
      borderRadius: 16,
    },
    googleButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    termsText: {
      color: colors.grey,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      maxWidth: 280,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: "600",
    },
    error: {
      color: colors.error,
      textAlign: "center",
    },
  }),
);
