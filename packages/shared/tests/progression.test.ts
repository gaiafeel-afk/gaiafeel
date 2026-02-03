import { describe, expect, it } from "vitest";
import {
  applyPenalty,
  computeMissedDayPenalty,
  hasSubscriptionAccess,
  requiresSubscription,
  resolveLockReason,
} from "../src/progression";

describe("progression rules", () => {
  it("applies one penalty per missed day", () => {
    const result = computeMissedDayPenalty({
      lastCompletedLocalDate: "2026-02-01",
      lastPenaltyProcessedLocalDate: null,
      todayLocalDate: "2026-02-04",
    });

    expect(result.missedDays).toBe(2);
    expect(result.processedThroughDate).toBe("2026-02-03");
  });

  it("is idempotent on repeated checks in same day", () => {
    const result = computeMissedDayPenalty({
      lastCompletedLocalDate: "2026-02-01",
      lastPenaltyProcessedLocalDate: "2026-02-03",
      todayLocalDate: "2026-02-04",
    });

    expect(result.missedDays).toBe(0);
    expect(result.processedThroughDate).toBe("2026-02-03");
  });

  it("never drops below worksheet 1", () => {
    expect(applyPenalty(2, 5)).toBe(1);
  });

  it("gates worksheet 4+ without active subscription", () => {
    expect(requiresSubscription(3)).toBe(false);
    expect(requiresSubscription(4)).toBe(true);
    expect(hasSubscriptionAccess(4, false)).toBe(false);
    expect(hasSubscriptionAccess(4, true)).toBe(true);
  });

  it("returns lock reason for gated paid content", () => {
    const reason = resolveLockReason({
      canCompleteToday: true,
      completedToday: false,
      nextSeqIndex: 4,
      entitlementActive: false,
    });

    expect(reason).toBe("SUBSCRIPTION_REQUIRED");
  });
});
