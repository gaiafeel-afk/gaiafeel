import type { CompletionPayload, DailyState, Worksheet } from "@somatic/shared";

import { supabase } from "@/lib/supabase";

interface CompletionRecord {
  id: string;
  seqIndex: number;
  localDate: string;
  completedAtUtc: string;
}

function mapWorksheet(row: any): Worksheet {
  return {
    id: row.id,
    seqIndex: row.seq_index,
    title: row.title,
    bodyJson: row.body_json,
    estimatedMinutes: row.estimated_minutes,
    isActive: row.is_active,
  };
}

export async function getDailyState(timezone?: string): Promise<DailyState> {
  const { data, error } = await supabase.functions.invoke("progression-get-state", {
    body: { timezone },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as DailyState;
}

export async function completeWorksheet(seqIndex: number, response: CompletionPayload) {
  const { data, error } = await supabase.functions.invoke("progression-complete", {
    body: { seqIndex, response },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    newState: DailyState;
    penaltyApplied: number;
    nextAvailableAtUtc: string | null;
  };
}

export async function listWorksheets(): Promise<Worksheet[]> {
  const { data, error } = await supabase
    .from("worksheets")
    .select("id, seq_index, title, body_json, estimated_minutes, is_active")
    .eq("is_active", true)
    .order("seq_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(mapWorksheet);
}

export async function listCompletions(limit = 50): Promise<CompletionRecord[]> {
  const { data, error } = await supabase
    .from("worksheet_completions")
    .select("id, seq_index, local_date, completed_at_utc")
    .order("completed_at_utc", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    seqIndex: row.seq_index,
    localDate: row.local_date,
    completedAtUtc: row.completed_at_utc,
  }));
}

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke("account-delete", {
    body: {},
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as { ok: boolean };
}
