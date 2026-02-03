import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Not found</Text>
      <Link href="/(tabs)/home" style={styles.link}>
        Go back home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});
