import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ImageStyle,
} from "react-native"
import { Image } from "expo-image"
import { colors, borderRadius } from "./theme"
import { Typography } from "./Typography"

type AvatarSize = "sm" | "md" | "lg" | "xl"

type AvatarProps = {
  source?: string | null
  name?: string
  size?: AvatarSize
  style?: StyleProp<ViewStyle>
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 24,
  md: 36,
  lg: 44,
  xl: 56,
}

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
}

export function Avatar({ source, name, size = "md", style }: AvatarProps) {
  const dimension = sizeMap[size]
  const initial = (name || "?")[0].toUpperCase()

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  }

  const imageStyle: ImageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  }

  if (source) {
    return <Image source={source} style={imageStyle} contentFit="cover" />
  }

  return (
    <View style={[styles.placeholder, containerStyle, style]}>
      <Typography
        variant="label"
        color="inverse"
        style={{ fontSize: fontSizeMap[size] }}
      >
        {initial}
      </Typography>
    </View>
  )
}

type TeamLogoProps = {
  source: string
  size?: AvatarSize
  withBackground?: boolean
  style?: StyleProp<ViewStyle>
}

export function TeamLogo({
  source,
  size = "lg",
  withBackground = true,
  style,
}: TeamLogoProps) {
  const dimension = sizeMap[size]
  const innerSize = withBackground ? dimension * 0.7 : dimension

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: borderRadius.lg,
  }

  const imageStyle: ImageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: borderRadius.lg,
  }

  if (withBackground) {
    return (
      <View style={[styles.logoBackground, containerStyle, style]}>
        <Image
          source={source}
          style={{ width: innerSize, height: innerSize }}
          contentFit="contain"
        />
      </View>
    )
  }

  return <Image source={source} style={imageStyle} contentFit="contain" />
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBackground: {
    backgroundColor: colors.textPrimary,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
})
