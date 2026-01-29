import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
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
  onPress?: () => void;
}

export default function MatchCard({
  teamA,
  teamB,
  matchTime,
  league,
  score,
  onPress,
}: MatchCardProps) {
  const CardContent = (
    <>
      {league && (
        <View style={styles.leagueHeader}>
          <Text style={styles.leagueText}>{league}</Text>
        </View>
      )}

      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          <View style={styles.logoWrapper}>
            <Image
              style={styles.teamLogo}
              source={teamA.logoUrl}
              contentFit="contain"
            />
          </View>
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
          <View style={styles.logoWrapper}>
            <Image
              style={styles.teamLogo}
              source={teamB.logoUrl}
              contentFit="contain"
            />
          </View>
          <Text style={styles.teamName}>{teamB.name}</Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{CardContent}</View>;
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
  logoWrapper: {
    width: 64,
    height: 64,
    backgroundColor: "#dee2e6",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogo: {
    width: "100%",
    height: "100%",
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
