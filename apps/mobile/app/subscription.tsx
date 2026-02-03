import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { purchaseMonthly } from "@/lib/revenuecat";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";

export default function SubscriptionScreen() {
  const router = useRouter();
  const timezone = useAppStore((state) => state.timezone);
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: purchaseMonthly,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dailyState", timezone] });
      Alert.alert("Subscription active", "You're all set. Your next worksheet is unlocked.");
      router.replace("/(tabs)/home");
    },
    onError: (error) => {
      Alert.alert("Purchase failed", error instanceof Error ? error.message : "Please try again.");
    },
  });

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Continue your progression</Text>
        <Text style={styles.body}>
          Worksheets 1-3 are free. A monthly subscription unlocks worksheet 4 and everything after it.
        </Text>
      </View>

      <PrimaryButton
        label="Start monthly subscription"
        onPress={() => purchaseMutation.mutate()}
        loading={purchaseMutation.isPending}
      />
      <PrimaryButton label="Not now" variant="secondary" onPress={() => router.back()} disabled={purchaseMutation.isPending} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    color: colors.subtext,
    fontSize: 15,
    lineHeight: 22,
  },
});
