import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);

  const handleContinue = () => {
    completeOnboarding(timezone);
    router.replace("/(auth)/sign-in");
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Welcome</Text>
        <Text style={styles.title}>A daily somatic practice you can actually keep.</Text>
        <Text style={styles.description}>
          Complete one worksheet per day. You unlock tomorrow's worksheet by showing up today.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Timezone</Text>
        <Text style={styles.description}>We use your timezone to enforce daily progression.</Text>
        <Text style={styles.timezoneValue}>{timezone}</Text>
      </View>

      <PrimaryButton label="Continue" onPress={handleContinue} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.subtext,
  },
  timezoneValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    backgroundColor: "#FFF2E3",
    borderRadius: 8,
    padding: 8,
  },
});
