import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { getDailyState, listCompletions, listWorksheets } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";

export default function ProgressScreen() {
  const timezone = useAppStore((state) => state.timezone);

  const stateQuery = useQuery({
    queryKey: ["dailyState", timezone],
    queryFn: () => getDailyState(timezone),
  });

  const worksheetsQuery = useQuery({
    queryKey: ["worksheets"],
    queryFn: listWorksheets,
  });

  const completionsQuery = useQuery({
    queryKey: ["completions"],
    queryFn: listCompletions,
  });

  if (stateQuery.isLoading || worksheetsQuery.isLoading || completionsQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>Loading progression map...</Text>
      </ScreenContainer>
    );
  }

  if (!stateQuery.data || !worksheetsQuery.data || !completionsQuery.data) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>Unable to load progression data.</Text>
      </ScreenContainer>
    );
  }

  const completedSeq = new Set(completionsQuery.data.map((item) => item.seqIndex));
  const currentSeq = stateQuery.data.currentSeqIndex;

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.heading}>Progression</Text>
        <Text style={styles.meta}>Current worksheet: {currentSeq}</Text>
      </View>

      {worksheetsQuery.data.map((worksheet) => {
        const isCompleted = completedSeq.has(worksheet.seqIndex);
        const isCurrent = worksheet.seqIndex === currentSeq;
        const isFuture = worksheet.seqIndex > currentSeq;

        return (
          <View key={worksheet.id} style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>
                {worksheet.seqIndex}. {worksheet.title}
              </Text>
              <Text style={styles.rowMeta}>{worksheet.estimatedMinutes} min</Text>
            </View>
            <Text
              style={[
                styles.status,
                isCompleted && styles.completed,
                isCurrent && styles.current,
                isFuture && styles.locked,
              ]}
            >
              {isCompleted ? "Completed" : isCurrent ? "Current" : "Locked"}
            </Text>
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    color: colors.subtext,
  },
  error: {
    color: colors.danger,
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowTitle: {
    color: colors.text,
    fontWeight: "600",
  },
  rowMeta: {
    marginTop: 4,
    color: colors.subtext,
    fontSize: 13,
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  completed: {
    color: colors.success,
  },
  current: {
    color: colors.primary,
  },
  locked: {
    color: colors.subtext,
  },
});
