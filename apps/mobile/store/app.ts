import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppStoreState {
  onboardingComplete: boolean;
  timezone: string;
  hydrated: boolean;
  markHydrated: () => void;
  completeOnboarding: (timezone: string) => void;
}

const fallbackTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      timezone: fallbackTimezone,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      completeOnboarding: (timezone) => set({ onboardingComplete: true, timezone }),
    }),
    {
      name: "somatic-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useAppStore.getState().markHydrated();
      },
    },
  ),
);
