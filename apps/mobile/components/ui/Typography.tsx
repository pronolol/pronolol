import {
  Text as RNText,
  StyleSheet,
  TextStyle,
  StyleProp,
  TextProps as RNTextProps,
} from "react-native"
import { colors, fontSize, fontWeight } from "./theme"

type TextVariant =
  | "display"
  | "title"
  | "subtitle"
  | "body"
  | "label"
  | "caption"
  | "small"
type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "inverse"
  | "success"
  | "error"
  | "warning"

type TypographyProps = RNTextProps & {
  variant?: TextVariant
  color?: TextColor
  weight?: keyof typeof fontWeight
  center?: boolean
  uppercase?: boolean
  style?: StyleProp<TextStyle>
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: 34,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: 20,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: 16,
  },
  caption: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
  },
  small: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: 14,
  },
}

const colorStyles: Record<TextColor, TextStyle> = {
  primary: { color: colors.textPrimary },
  secondary: { color: colors.textSecondary },
  muted: { color: colors.textMuted },
  inverse: { color: colors.textInverse },
  success: { color: colors.success },
  error: { color: colors.error },
  warning: { color: colors.warningDark },
}

export function Typography({
  variant = "body",
  color = "primary",
  weight,
  center,
  uppercase,
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <RNText
      style={[
        variantStyles[variant],
        colorStyles[color],
        weight && { fontWeight: fontWeight[weight] },
        center && styles.center,
        uppercase && styles.uppercase,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  center: {
    textAlign: "center",
  },
  uppercase: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
})

// Convenience components
export function Title(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="title" {...props} />
}

export function Subtitle(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="subtitle" color="secondary" {...props} />
}

export function Body(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="body" {...props} />
}

export function Label(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="label" {...props} />
}

export function Caption(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="caption" color="secondary" {...props} />
}

export function Small(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="small" color="secondary" {...props} />
}
