import { StyleSheet, View, ScrollView } from "react-native";
import MatchCard from "../components/MatchCard";

export default function Index() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <MatchCard
          teamA={{
            name: "BFX",
            logoUrl:
              "https://am-a.akamaihd.net/image?resize=96:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1734691810721_BFXfullcolorfordarkbg.png",
          }}
          teamB={{
            name: "T1",
            logoUrl:
              "https://am-a.akamaihd.net/image?resize=96:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1734691810721_BFXfullcolorfordarkbg.png",
          }}
          matchTime="Today 18:00"
          league="LCK Spring 2026"
        />

        <MatchCard
          teamA={{
            name: "BFX",
            logoUrl:
              "https://am-a.akamaihd.net/image?resize=96:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1734691810721_BFXfullcolorfordarkbg.png",
          }}
          teamB={{
            name: "GEN",
            logoUrl:
              "https://am-a.akamaihd.net/image?resize=96:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1734691810721_BFXfullcolorfordarkbg.png",
          }}
          matchTime="Tomorrow 15:00"
          league="LCK Spring 2026"
          score={{ teamA: 1, teamB: 2 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
});
