/**
 * Design System Theme Constants
 * Centralized styling values for consistent UI across the app
 */

export const colors = {
  // Primary
  primary: "#6366f1",
  primaryLight: "#eef2ff",
  primaryDark: "#4f46e5",

  // Secondary
  secondary: "#007AFF",
  secondaryLight: "#e0f2fe",

  // Status
  success: "#10b981",
  successLight: "#ecfdf5",
  successDark: "#059669",

  warning: "#f59e0b",
  warningLight: "#fffbeb",
  warningDark: "#d97706",

  error: "#ef4444",
  errorLight: "#fef2f2",
  errorDark: "#dc2626",

  live: "#ef4444",

  // Neutrals
  background: "#f8f9fa",
  backgroundSecondary: "#f5f5f5",
  surface: "#ffffff",
  surfaceSecondary: "#f8f9fa",

  // Text
  textPrimary: "#1a1a2e",
  textSecondary: "#6c757d",
  textMuted: "#adb5bd",
  textInverse: "#ffffff",

  // Borders
  border: "#e9ecef",
  borderLight: "#f1f3f4",
  borderDark: "#dee2e6",

  // Social
  discord: "#5865F2",
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
} as const

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  xxxl: 24,
  display: 28,
} as const

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
}

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
} as const

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadow,
} as const

export type Theme = typeof theme
export type Colors = typeof colors
export type Spacing = typeof spacing
