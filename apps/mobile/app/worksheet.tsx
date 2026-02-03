import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { completeWorksheet, getDailyState } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";

export default function WorksheetScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const timezone = useAppStore((state) => state.timezone);
  const { seq } = useLocalSearchParams<{ seq: string }>();
  const [reflection, setReflection] = useState("");

  const seqIndex = useMemo(() => {
    const parsed = Number(seq);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [seq]);

  const stateQuery = useQuery({
    queryKey: ["dailyState", timezone],
    queryFn: () => getDailyState(timezone),
  });

  const completionMutation = useMutation({
    mutationFn: () =>
      completeWorksheet(seqIndex, {
        responses: [
          {
            promptId: "reflection",
            value: reflection.trim() || "Completed",
          },
        ],
        notes: reflection.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dailyState", timezone] }),
        queryClient.invalidateQueries({ queryKey: ["completions"] }),
      ]);
      router.replace("/(tabs)/home");
    },
    onError: (error) => {
      Alert.alert("Unable to submit", error instanceof Error ? error.message : "Please try again.");
    },
  });

  if (stateQuery.isLoading || !stateQuery.data) {
    return (
      <ScreenContainer>
        <Text style={styles.loadingText}>Loading worksheet...</Text>
      </ScreenContainer>
    );
  }

  const state = stateQuery.data;

  if (!state.canCompleteToday || state.currentSeqIndex !== seqIndex) {
    return (
      <ScreenContainer>
        <View style={styles.card}>
          <Text style={styles.title}>Worksheet locked</Text>
          <Text style={styles.subtitle}>This worksheet is not currently available to complete.</Text>
          <PrimaryButton label="Back to home" onPress={() => router.replace("/(tabs)/home")} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Worksheet {seqIndex}</Text>
        <Text style={styles.subtitle}>{state.currentWorksheet?.title}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Prompt</Text>
        <Text style={styles.prompt}>
          Where do you feel tension in your body right now, and what sensation stands out most?
        </Text>

        <Text style={styles.label}>Reflection</Text>
        <TextInput
          style={styles.input}
          value={reflection}
          onChangeText={setReflection}
          multiline
          placeholder="Write a short reflection..."
          placeholderTextColor="#9D9387"
          textAlignVertical="top"
        />
      </View>

      <PrimaryButton
        label="Submit today's worksheet"
        onPress={() => completionMutation.mutate()}
        loading={completionMutation.isPending}
      />
      <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} disabled={completionMutation.isPending} />
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
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 15,
  },
  label: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 14,
  },
  prompt: {
    color: colors.subtext,
    lineHeight: 22,
  },
  input: {
    minHeight: 140,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  loadingText: {
    marginTop: 24,
    color: colors.subtext,
  },
});
