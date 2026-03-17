import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { AppShell } from "@/components/layout/AppShell"
import { HomePage } from "@/pages/HomePage"
import { MatchDetailPage } from "@/pages/MatchDetailPage"
import { RankingPage } from "@/pages/RankingPage"
import { SignInPage } from "@/pages/SignInPage"
import { SignUpPage } from "@/pages/SignUpPage"
import { OAuthCallbackPage } from "@/pages/OAuthCallbackPage"

const App = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Route>
      </Route>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/callback" element={<OAuthCallbackPage />} />
    </Routes>
  )
}

export default App
