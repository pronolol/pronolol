import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native"

interface InputProps extends TextInputProps {
  label: string
  error?: string
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  error: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 4,
  },
})
