import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import MatchCard from "../components/MatchCard";
import { useGetMatches } from "../api";

export default function Index() {
  const {
    data: matches,
    isLoading,
    error,
  } = useGetMatches({
    state: "completed",
    limit: "20",
  });

  console.log("Match data:", { matches, isLoading, error });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading matches</Text>
        <Text style={styles.errorDetail}>
          {error instanceof Error ? error.message : JSON.stringify(error)}
        </Text>
        <Text style={styles.errorDetail}>
          Make sure the API is running at http://localhost:3000
        </Text>
      </View>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No upcoming matches found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          />
        ))}
      </ScrollView>
    </View>
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
