import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { getDailyState } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";

function lockCopy(lockReason: string) {
  switch (lockReason) {
    case "ALREADY_COMPLETED_TODAY":
      return "Great work today. Come back tomorrow for your next worksheet.";
    case "WAITING_FOR_TOMORROW":
      return "Your next worksheet opens tomorrow in your local timezone.";
    case "SUBSCRIPTION_REQUIRED":
      return "You are entering paid worksheets. Subscribe to continue your sequence.";
    default:
      return "Ready when you are.";
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const timezone = useAppStore((state) => state.timezone);

  const dailyState = useQuery({
    queryKey: ["dailyState", timezone],
    queryFn: () => getDailyState(timezone),
  });

  if (dailyState.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.loadingText}>Loading your daily worksheet...</Text>
      </ScreenContainer>
    );
  }

  if (dailyState.isError || !dailyState.data) {
    return (
      <ScreenContainer>
        <Text style={styles.errorText}>{dailyState.error instanceof Error ? dailyState.error.message : "Unable to load state."}</Text>
      </ScreenContainer>
    );
  }

  const state = dailyState.data;

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Today</Text>
        <Text style={styles.title}>Worksheet {state.currentSeqIndex}</Text>
        <Text style={styles.subtitle}>{state.currentWorksheet?.title ?? "No active worksheet"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.statusText}>{lockCopy(state.lockReason)}</Text>
        {state.nextAvailableAtUtc ? (
          <Text style={styles.meta}>Next unlock: {new Date(state.nextAvailableAtUtc).toLocaleString()}</Text>
        ) : null}
      </View>

      {state.canCompleteToday && state.currentWorksheet ? (
        <PrimaryButton
          label="Open today's worksheet"
          onPress={() =>
            router.push({
              pathname: "/worksheet",
              params: { seq: String(state.currentWorksheet?.seqIndex ?? state.currentSeqIndex) },
            })
          }
        />
      ) : null}

      {state.lockReason === "SUBSCRIPTION_REQUIRED" ? (
        <PrimaryButton label="View subscription" onPress={() => router.push("/subscription")} />
      ) : null}

      <PrimaryButton label="Refresh" variant="secondary" onPress={() => void dailyState.refetch()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  statusText: {
    color: colors.subtext,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: colors.subtext,
    fontSize: 13,
  },
  loadingText: {
    marginTop: 24,
    color: colors.subtext,
  },
  errorText: {
    marginTop: 24,
    color: colors.danger,
  },
});
