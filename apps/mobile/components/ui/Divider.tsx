import { View, StyleSheet } from "react-native"
import { colors, spacing } from "./theme"
import { Typography } from "./Typography"

type DividerProps = {
  text?: string
}

export default function Divider({ text = "or" }: DividerProps) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Typography variant="body" color="secondary" style={styles.dividerText}>
        {text}
      </Typography>
      <View style={styles.dividerLine} />
    </View>
  )
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
  },
})
