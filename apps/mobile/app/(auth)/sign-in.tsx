import { useState } from "react"
import { Alert } from "react-native"
import { useRouter } from "expo-router"
import { signIn } from "@/lib/auth-client"
import * as WebBrowser from "expo-web-browser"
import AuthContainer from "@/components/ui/AuthContainer"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Divider from "@/components/ui/Divider"

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const handleDiscordSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn.social(
        {
          provider: "discord",
          callbackURL: "/callback",
        },
        {
          onSuccess: async () => {
            // Session will be handled by the callback page
            console.log("Discord OAuth initiated successfully")
          },
          onError: (ctx) => {
            console.error("Discord OAuth error:", ctx.error)
            Alert.alert("Error", ctx.error.message || "Discord sign in failed")
          },
        }
      )
    } catch (error: any) {
      console.error("Discord OAuth error:", error)
      Alert.alert("Error", error.message || "Discord sign in failed")
    } finally {
      setIsLoading(false)
    }
  }
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: async () => {
            // Session is automatically stored by better-auth expo plugin
            // Navigate to home after successful sign in
            router.replace("/")
          },
          onError: (ctx) => {
            Alert.alert(
              "Sign In Failed",
              ctx.error.message || "Invalid credentials"
            )
          },
        }
      )

      // Handle result if callbacks aren't used
      if (result?.error) {
        Alert.alert(
          "Sign In Failed",
          result.error.message || "Invalid credentials"
        )
      } else if (result?.data) {
        // Successful sign in
        router.replace("/")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      Alert.alert("Error", error.message || "An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContainer
      title="Welcome Back"
      subtitle="Sign in to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      footerLinkTo="/(auth)/sign-up"
    >
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
        textContentType="password"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <Button
        title="Sign In"
        onPress={handleSignIn}
        loading={isLoading}
        disabled={isLoading}
      />

      <Divider />

      <Button
        title="Continue with Discord"
        variant="discord"
        onPress={handleDiscordSignIn}
        loading={isLoading}
        disabled={isLoading}
      />
    </AuthContainer>
  )
}
