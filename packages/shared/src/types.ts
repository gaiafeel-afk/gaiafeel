export type LockReason =
  | "OK"
  | "WAITING_FOR_TOMORROW"
  | "ALREADY_COMPLETED_TODAY"
  | "SUBSCRIPTION_REQUIRED"
  | "OUT_OF_SEQUENCE"
  | "INVALID_WORKSHEET";

export interface Worksheet {
  id: string;
  seqIndex: number;
  title: string;
  bodyJson: Record<string, unknown>;
  estimatedMinutes: number;
  isActive: boolean;
}

export interface CompletionPayload {
  responses: Array<{
    promptId: string;
    value: string | number | boolean;
  }>;
  notes?: string;
  moodRating?: number;
}

export interface Entitlement {
  userId: string;
  isActive: boolean;
  productId: string | null;
  expiresAtUtc: string | null;
  source: "revenuecat" | "manual";
}

export interface ProgressionEvent {
  id: string;
  userId: string;
  eventType: "COMPLETE" | "RESET";
  delta: number;
  fromSeq: number;
  toSeq: number;
  eventLocalDate: string;
  createdAt: string;
}

export interface DailyState {
  currentSeqIndex: number;
  currentWorksheet: Worksheet | null;
  canCompleteToday: boolean;
  lockReason: LockReason;
  subscriptionRequired: boolean;
  nextAvailableAtUtc: string | null;
  completedToday: boolean;
  streakMeta: {
    lastCompletedLocalDate: string | null;
    missedDaysSinceLastCompletion: number;
  };
}

export interface ProgressionState {
  currentSeqIndex: number;
  lastCompletedLocalDate: string | null;
  lastPenaltyProcessedLocalDate: string | null;
  nextAvailableAtUtc: string | null;
}
