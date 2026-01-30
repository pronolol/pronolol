import { useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"
import { signUp, signIn } from "@/lib/auth-client"
import * as WebBrowser from "expo-web-browser"
import AuthContainer from "@/components/ui/AuthContainer"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

WebBrowser.maybeCompleteAuthSession()

export default function SignUpScreen() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDiscordSignUp = async () => {
    setIsLoading(true)
    try {
      const result = await signIn.social({
        provider: "discord",
        callbackURL: "/callback",
      })

      if (result.error) {
        Alert.alert("Error", result.error.message || "Discord sign up failed")
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Discord sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      const result = await signUp.email({
        email,
        password,
        name: username,
        username: username,
      })

      if (result.error) {
        Alert.alert(
          "Sign Up Failed",
          result.error.message || "Could not create account"
        )
      } else {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/") },
        ])
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContainer
      title="Create Account"
      subtitle="Sign up to get started"
      footerText="Already have an account?"
      footerLinkText="Sign In"
      footerLinkTo="/(auth)/sign-in"
    >
      <Input
        label="Username"
        placeholder="johndoe"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading}
      />

      <Input
        label="Email"
        placeholder="email@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading}
      />

      <Input
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <Input
        label="Confirm Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        textContentType="newPassword"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <Button
        title="Sign Up"
        onPress={handleSignUp}
        loading={isLoading}
        disabled={isLoading}
      />

      <Divider />

      <Button
        title="Continue with Discord"
        variant="discord"
        onPress={handleDiscordSignUp}
        loading={isLoading}
        disabled={isLoading}
      />
    </AuthContainer>
  )
}
