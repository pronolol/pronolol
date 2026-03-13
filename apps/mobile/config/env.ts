/**
 * Environment configuration
 *
 * This module provides access to environment variables with fallbacks.
 * In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be accessible.
 *
 * Development setup:
 * 1. Copy .env.example to .env.local
 * 2. Update EXPO_PUBLIC_API_URL with your local network IP
 * 3. Find your IP:
 *    - macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
 *    - Windows: ipconfig
 *    - Linux: hostname -I
 *
 * Production setup:
 * Set EXPO_PUBLIC_API_URL to your production domain (e.g., https://api.yourdomain.com)
 */

import { Platform } from "react-native"

/**
 * Get API base URL from environment variables
 * Falls back to localhost if not configured
 */
export const getApiUrl = (): string => {
  // Try to get from Expo's environment variables
  const envUrl = process.env.EXPO_PUBLIC_API_URL

  if (envUrl) {
    return envUrl
  }

  // Fallback for development
  if (__DEV__) {
    console.warn(
      "⚠️  EXPO_PUBLIC_API_URL not configured!\n" +
        "Please create a .env.local file with your API URL.\n" +
        "See .env.example for instructions."
    )

    // Default development fallback
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000" // Android emulator default
    }
    return "http://localhost:3000"
  }

  // Production should always have this configured
  throw new Error(
    "EXPO_PUBLIC_API_URL must be configured in production. " +
      "Set this environment variable before building."
  )
}

export const API_BASE_URL = getApiUrl()

// Log current configuration in development
if (__DEV__) {
  console.log("📡 API Configuration:", {
    url: API_BASE_URL,
    platform: Platform.OS,
    isDev: __DEV__,
  })
}
