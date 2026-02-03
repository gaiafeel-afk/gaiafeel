import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { deleteAccount } from "@/lib/api";
import { restorePurchases } from "@/lib/revenuecat";
import { colors } from "@/lib/theme";
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/auth";

export default function SettingsScreen() {
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const timezone = useAppStore((state) => state.timezone);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await restorePurchases();
      Alert.alert("Purchases restored", "Any active entitlement has been synced.");
    } catch (error) {
      Alert.alert("Restore failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This permanently removes your account and worksheet history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAccount();
              await signOut();
              Alert.alert("Account deleted", "Your data has been removed.");
            } catch (error) {
              Alert.alert("Deletion failed", error instanceof Error ? error.message : "Please try again.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.heading}>Account</Text>
        <Text style={styles.meta}>Signed in as: {session?.user.email ?? "Unknown"}</Text>
        <Text style={styles.meta}>Timezone: {timezone}</Text>
      </View>

      <PrimaryButton label="Restore purchases" onPress={handleRestore} loading={restoring} />
      <PrimaryButton
        label="Delete account"
        variant="secondary"
        onPress={handleDeleteAccount}
        disabled={restoring || deleting}
        loading={deleting}
      />
      <PrimaryButton
        label="Sign out"
        variant="secondary"
        onPress={() => void signOut()}
        disabled={restoring || deleting}
      />
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
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    color: colors.subtext,
    fontSize: 14,
  },
});
