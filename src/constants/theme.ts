import { useColorScheme } from "react-native";

export type Colors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceLight: string;
  // main text and icon colour: white on dark, black on light
  text: string;
  grey: string;
  error: string;
};

export const PALETTES: Record<"dark" | "light", Colors> = {
  dark: {
    primary: "#4ADE80",
    secondary: "#2DD4BF",
    background: "#000000",
    surface: "#1A1A1A",
    surfaceLight: "#2A2A2A",
    text: "#FFFFFF",
    grey: "#9CA3AF",
    error: "#F87171",
  },
  light: {
    // darker green so it stays readable on white
    primary: "#16A34A",
    secondary: "#0D9488",
    background: "#FFFFFF",
    surface: "#EFEFEF",
    surfaceLight: "#DBDBDB",
    text: "#000000",
    grey: "#737373",
    error: "#DC2626",
  },
};

// colours that stay the same in both themes, e.g. text on photos or buttons
export const FIXED = {
  white: "#FFFFFF",
  black: "#000000",
} as const;

// the palette for the phone's current light/dark setting
export function useTheme(): Colors {
  return PALETTES[useColorScheme() === "light" ? "light" : "dark"];
}

// turn a style factory into a hook; each palette's styles are built once
export function makeStyles<T>(factory: (colors: Colors) => T) {
  const cache = new Map<Colors, T>();
  return function useStyles(): T {
    const colors = useTheme();
    let styles = cache.get(colors);
    if (!styles) {
      styles = factory(colors);
      cache.set(colors, styles);
    }
    return styles;
  };
}
