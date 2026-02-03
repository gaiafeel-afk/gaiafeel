import { describe, expect, it } from "vitest";

import { STRESS_QUESTIONS, calculateStressResult, isEmailValid, type StressAnswers } from "./stressQuiz";

function buildAnswers(value: 0 | 1 | 2 | 3): StressAnswers {
  return STRESS_QUESTIONS.reduce<StressAnswers>((accumulator, question) => {
    accumulator[question.id] = value;
    return accumulator;
  }, {});
}

describe("calculateStressResult", () => {
  it("returns null when not all questions have answers", () => {
    const partialAnswers = buildAnswers(2);
    delete partialAnswers[STRESS_QUESTIONS[0].id];

    expect(calculateStressResult(partialAnswers)).toBeNull();
  });

  it("classifies low stress for small scores", () => {
    const result = calculateStressResult(buildAnswers(0));

    expect(result?.level).toBe("Low");
    expect(result?.score).toBe(0);
  });

  it("classifies very high stress for top scores", () => {
    const result = calculateStressResult(buildAnswers(3));

    expect(result?.level).toBe("Very high");
    expect(result?.score).toBe(STRESS_QUESTIONS.length * 3);
  });
});

describe("isEmailValid", () => {
  it("accepts common valid emails", () => {
    expect(isEmailValid("hello@example.com")).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(isEmailValid("not-an-email")).toBe(false);
  });
});
