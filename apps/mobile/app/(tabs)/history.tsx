import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { listCompletions } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function HistoryScreen() {
  const completionsQuery = useQuery({
    queryKey: ["completions"],
    queryFn: () => listCompletions(100),
  });

  if (completionsQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>Loading completion history...</Text>
      </ScreenContainer>
    );
  }

  if (completionsQuery.isError || !completionsQuery.data) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>Unable to load history.</Text>
      </ScreenContainer>
    );
  }

  if (!completionsQuery.data.length) {
    return (
      <ScreenContainer>
        <View style={styles.card}>
          <Text style={styles.heading}>No entries yet</Text>
          <Text style={styles.meta}>Your completed worksheets will appear here.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {completionsQuery.data.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.heading}>Worksheet {item.seqIndex}</Text>
          <Text style={styles.meta}>{new Date(item.completedAtUtc).toLocaleString()}</Text>
          <Text style={styles.meta}>Local date: {item.localDate}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  heading: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  meta: {
    color: colors.subtext,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
  },
});
