import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import { bootstrapAuthFromInitialUrl, subscribeToAuthLinks } from "@/lib/auth-linking";
import { supabase } from "@/lib/supabase";

interface AuthStore {
  session: Session | null;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  signOut: () => Promise<void>;
}

let hasListener = false;

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  bootstrapped: false,
  bootstrap: async () => {
    if (!hasListener) {
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
      subscribeToAuthLinks();
      hasListener = true;
    }

    await bootstrapAuthFromInitialUrl();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({ session, bootstrapped: true });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
