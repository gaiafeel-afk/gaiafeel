import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from "react-native";

import { colors } from "@/lib/theme";

interface Props extends PropsWithChildren {
  padded?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, padded = true, style }: Props) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <ScrollView
        contentContainerStyle={[styles.content, padded && styles.padded]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    padding: 20,
    gap: 16,
  },
});
