import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/client.ts";
import { resolveErrorStatus } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createUserClient(req);

    const body = (await req.json().catch(() => ({}))) as { timezone?: string };
    const timezone = body.timezone?.trim();

    const { data, error } = await supabase.rpc("get_daily_state", {
      p_timezone: timezone || null,
    });

    if (error) {
      return jsonResponse({ error: error.message }, resolveErrorStatus(error.message));
    }

    return jsonResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, resolveErrorStatus(message));
  }
});
