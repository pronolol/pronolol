import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

interface Team {
  name: string;
  logoUrl: string;
}

interface MatchCardProps {
  teamA: Team;
  teamB: Team;
  matchTime?: string;
  league?: string;
  score?: {
    teamA: number;
    teamB: number;
  };
}

export default function MatchCard({
  teamA,
  teamB,
  matchTime,
  league,
  score,
}: MatchCardProps) {
  return (
    <View style={styles.card}>
      {league && (
        <View style={styles.leagueHeader}>
          <Text style={styles.leagueText}>{league}</Text>
        </View>
      )}

      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          <Image
            style={styles.teamLogo}
            source={teamA.logoUrl}
            contentFit="contain"
          />
          <Text style={styles.teamName}>{teamA.name}</Text>
        </View>

        <View style={styles.vsContainer}>
          {score ? (
            <>
              <Text style={styles.scoreText}>
                {score.teamA} - {score.teamB}
              </Text>
              {matchTime && <Text style={styles.timeText}>{matchTime}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.vsText}>VS</Text>
              {matchTime && <Text style={styles.timeText}>{matchTime}</Text>}
            </>
          )}
        </View>

        <View style={styles.teamContainer}>
          <Image
            style={styles.teamLogo}
            source={teamB.logoUrl}
            contentFit="contain"
          />
          <Text style={styles.teamName}>{teamB.name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    elevation: 4,
    overflow: "hidden",
  },
  leagueHeader: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  leagueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  teamLogo: {
    width: 64,
    height: 64,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
    textAlign: "center",
  },
  vsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  vsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#adb5bd",
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6c757d",
    marginTop: 4,
  },
});
