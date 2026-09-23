import { StyleSheet } from "react-native";

import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  brandSection: {
    alignItems: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4ade8028",
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
    color: COLORS.primary,
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.grey,
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
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 16,
  },
  googleButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  termsText: {
    color: COLORS.grey,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 280,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  error: {
    color: COLORS.error,
    textAlign: "center",
  },
});
