import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Slot, useSegments } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { configureRevenueCat } from "@/lib/revenuecat";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/auth";

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: colors.bg,
      }}
    >
      <ActivityIndicator color={colors.primary} />
      <Text style={{ color: colors.subtext }}>Preparing your daily space...</Text>
    </View>
  );
}

function RootNavigator() {
  const segments = useSegments();
  const { session, bootstrapped, bootstrap } = useAuthStore();
  const { hydrated, onboardingComplete } = useAppStore();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (session?.user.id) {
      void configureRevenueCat(session.user.id).catch(() => {
        // Safe no-op: app still runs even if RevenueCat is not configured in dev.
      });
    }
  }, [session?.user.id]);

  if (!bootstrapped || !hydrated) {
    return <LoadingScreen />;
  }

  const isAuthSegment = segments[0] === "(auth)";
  const isOnboardingScreen = segments[0] === "onboarding";

  if (!onboardingComplete && !isOnboardingScreen) {
    return <Redirect href="/onboarding" />;
  }

  if (!session && !isAuthSegment) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (session && (isAuthSegment || isOnboardingScreen)) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
