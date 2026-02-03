import type { LockReason } from "./types";

export const FREE_WORKSHEET_COUNT = 3;

const MS_PER_DAY = 86_400_000;

function parseLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatLocalDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(localDate: string, days: number): string {
  const base = parseLocalDate(localDate);
  return formatLocalDate(new Date(base.getTime() + days * MS_PER_DAY));
}

export function daysBetween(startDateExclusive: string, endDateInclusive: string): number {
  const start = parseLocalDate(startDateExclusive).getTime();
  const end = parseLocalDate(endDateInclusive).getTime();
  if (end <= start) {
    return 0;
  }

  return Math.floor((end - start) / MS_PER_DAY);
}

export function getLocalDateString(nowUtc: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(nowUtc);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format local date for timezone: ${timezone}`);
  }

  return `${year}-${month}-${day}`;
}

export interface MissedDayInputs {
  lastCompletedLocalDate: string | null;
  lastPenaltyProcessedLocalDate: string | null;
  todayLocalDate: string;
}

export interface MissedDayResult {
  missedDays: number;
  processedThroughDate: string | null;
}

export function computeMissedDayPenalty(inputs: MissedDayInputs): MissedDayResult {
  const { lastCompletedLocalDate, lastPenaltyProcessedLocalDate, todayLocalDate } = inputs;

  if (!lastCompletedLocalDate) {
    return {
      missedDays: 0,
      processedThroughDate: lastPenaltyProcessedLocalDate,
    };
  }

  const yesterday = addDays(todayLocalDate, -1);
  const baseline =
    lastPenaltyProcessedLocalDate && lastPenaltyProcessedLocalDate > lastCompletedLocalDate
      ? lastPenaltyProcessedLocalDate
      : lastCompletedLocalDate;

  const missedDays = daysBetween(baseline, yesterday);
  return {
    missedDays,
    processedThroughDate: missedDays > 0 ? yesterday : lastPenaltyProcessedLocalDate,
  };
}

export function applyPenalty(currentSeqIndex: number, missedDays: number): number {
  return Math.max(1, currentSeqIndex - missedDays);
}

export function requiresSubscription(seqIndex: number): boolean {
  return seqIndex > FREE_WORKSHEET_COUNT;
}

export function hasSubscriptionAccess(seqIndex: number, entitlementActive: boolean): boolean {
  if (!requiresSubscription(seqIndex)) {
    return true;
  }

  return entitlementActive;
}

export interface LockInputs {
  canCompleteToday: boolean;
  completedToday: boolean;
  nextSeqIndex: number;
  entitlementActive: boolean;
}

export function resolveLockReason(inputs: LockInputs): LockReason {
  const { canCompleteToday, completedToday, nextSeqIndex, entitlementActive } = inputs;

  if (!canCompleteToday) {
    return completedToday ? "ALREADY_COMPLETED_TODAY" : "WAITING_FOR_TOMORROW";
  }

  if (requiresSubscription(nextSeqIndex) && !entitlementActive) {
    return "SUBSCRIPTION_REQUIRED";
  }

  return "OK";
}
