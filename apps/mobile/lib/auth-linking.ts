import * as Linking from "expo-linking";
import type { EmailOtpType } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

function extractParams(url: string): Record<string, string> {
  const parsed = Linking.parse(url);
  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(parsed.queryParams ?? {})) {
    if (typeof value === "string") {
      params[key] = value;
    }
  }

  const hashIndex = url.indexOf("#");
  if (hashIndex >= 0) {
    const hash = url.slice(hashIndex + 1);
    const hashParams = new URLSearchParams(hash);
    for (const [key, value] of hashParams.entries()) {
      params[key] = value;
    }
  }

  return params;
}

async function handleAuthUrl(url: string) {
  const params = extractParams(url);

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return;
  }

  const tokenHash = params.token_hash;
  const type = params.type;
  if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
  }
}

export async function bootstrapAuthFromInitialUrl() {
  const url = await Linking.getInitialURL();
  if (url) {
    await handleAuthUrl(url);
  }
}

export function subscribeToAuthLinks() {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    void handleAuthUrl(url);
  });

  return () => {
    subscription.remove();
  };
}
