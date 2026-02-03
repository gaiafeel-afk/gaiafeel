import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/client.ts";
import { resolveErrorStatus } from "../_shared/errors.ts";

interface CompleteBody {
  seqIndex?: number;
  response?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createUserClient(req);
    const body = (await req.json()) as CompleteBody;

    if (!body || typeof body.seqIndex !== "number" || body.seqIndex < 1) {
      return jsonResponse({ error: "INVALID_SEQ_INDEX" }, 400);
    }

    if (!body.response || typeof body.response !== "object") {
      return jsonResponse({ error: "MISSING_RESPONSE" }, 400);
    }

    const { data, error } = await supabase.rpc("complete_daily_worksheet", {
      p_seq_index: body.seqIndex,
      p_response: body.response,
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
