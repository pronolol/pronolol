import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import MatchCard from "@/components/MatchCard";
import { useGetMatches } from "@/api";
import { useSession, signOut } from "@/lib/auth-client";

export default function Index() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.replace("/(auth)/sign-in");
    }
  }, [session, isSessionLoading]);
  const {
    data: matches,
    isLoading,
    error,
  } = useGetMatches({
    limit: "20",
    state: "completed",
  });

  const handleSignOut = async () => {
    await signOut();
  };

  if (isSessionLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading matches</Text>
        <Text style={styles.errorDetail}>
          {error instanceof Error ? error.message : JSON.stringify(error)}
        </Text>
        <Text style={styles.errorDetail}>
          Make sure the API is running at http://localhost:3000
        </Text>
      </SafeAreaView>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No upcoming matches found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>
            Welcome,{" "}
            {session?.user?.displayUsername ||
              session?.user?.username ||
              session?.user?.name}
            !
          </Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {matches?.map((match) => (
          <MatchCard
            key={match.id}
            teamA={{
              name: match.teamA.tag,
              logoUrl: match.teamA.logoUrl,
            }}
            teamB={{
              name: match.teamB.tag,
              logoUrl: match.teamB.logoUrl,
            }}
            matchTime={new Date(match.matchDate).toLocaleString()}
            league={`${match.tournament.league.name} - ${match.tournament.name}`}
            score={
              match.teamAScore !== null && match.teamBScore !== null
                ? { teamA: match.teamAScore, teamB: match.teamBScore }
                : undefined
            }
            onPress={() => router.push(`/matches/${match.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  signOutButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
  },
  signInButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  signUpButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "#6c757d",
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
  },
});
