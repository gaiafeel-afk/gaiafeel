import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/client.ts";

interface RevenueCatEvent {
  app_user_id?: string;
  product_id?: string;
  type?: string;
  expiration_at_ms?: number | string | null;
}

interface RevenueCatWebhookBody {
  event?: RevenueCatEvent;
}

function toIso(value?: number | null): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function computeActive(event: RevenueCatEvent): boolean {
  const type = event.type ?? "";
  const expirationMs =
    typeof event.expiration_at_ms === "string"
      ? Number(event.expiration_at_ms)
      : event.expiration_at_ms ?? null;

  if (["EXPIRATION", "CANCELLATION", "REFUND", "SUBSCRIPTION_PAUSED"].includes(type)) {
    return false;
  }

  if (!expirationMs) {
    return true;
  }

  return expirationMs > Date.now();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const configuredSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET") ?? "";
  const authHeader = req.headers.get("authorization") ?? "";

  if (!configuredSecret || authHeader !== `Bearer ${configuredSecret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const body = (await req.json()) as RevenueCatWebhookBody;
    const event = body.event;

    if (!event?.app_user_id) {
      return jsonResponse({ error: "Missing app_user_id" }, 400);
    }

    const userId = event.app_user_id;
    const expirationMsRaw = event.expiration_at_ms;
    const expirationMs =
      typeof expirationMsRaw === "string" ? Number(expirationMsRaw) : expirationMsRaw ?? null;
    const isActive = computeActive({ ...event, expiration_at_ms: expirationMs ?? undefined });
    const expiresAt = toIso(expirationMs);

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("entitlements").upsert(
      {
        user_id: userId,
        is_active: isActive,
        product_id: event.product_id ?? null,
        expires_at_utc: expiresAt,
        source: "revenuecat",
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
