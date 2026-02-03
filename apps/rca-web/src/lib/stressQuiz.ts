export interface StressQuestion {
  id: string;
  prompt: string;
}

export interface AnswerOption {
  label: string;
  description: string;
  value: StressAnswerValue;
}

export type StressAnswerValue = 0 | 1 | 2 | 3;
export type StressAnswers = Record<string, StressAnswerValue | undefined>;

export interface StressResult {
  score: number;
  maxScore: number;
  level: "Low" | "Mild" | "High" | "Very high";
  summary: string;
  nextStep: string;
}

export const ANSWER_OPTIONS: ReadonlyArray<AnswerOption> = [
  { value: 0, label: "Never", description: "Almost not at all" },
  { value: 1, label: "Sometimes", description: "A few times lately" },
  { value: 2, label: "Often", description: "Happens many days" },
  { value: 3, label: "Almost always", description: "Feels constant" },
];

export const STRESS_QUESTIONS: ReadonlyArray<StressQuestion> = [
  { id: "sleep", prompt: "How often do worries make it hard for you to sleep?" },
  { id: "focus", prompt: "How often do you find it hard to focus on simple tasks?" },
  { id: "tense", prompt: "How often do you feel physically tense or on edge?" },
  { id: "overwhelmed", prompt: "How often do daily responsibilities feel overwhelming?" },
  { id: "irritable", prompt: "How often do you feel easily irritated lately?" },
  { id: "energy", prompt: "How often do you feel drained even after resting?" },
  { id: "disconnect", prompt: "How often do you feel disconnected from people around you?" },
  { id: "control", prompt: "How often do you feel things are out of your control?" },
];

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function calculateStressResult(answers: StressAnswers): StressResult | null {
  const hasAllAnswers = STRESS_QUESTIONS.every((question) => answers[question.id] !== undefined);
  if (!hasAllAnswers) {
    return null;
  }

  const score = STRESS_QUESTIONS.reduce((total, question) => total + (answers[question.id] ?? 0), 0);
  const maxScore = STRESS_QUESTIONS.length * 3;
  const ratio = score / maxScore;

  if (ratio <= 0.25) {
    return {
      score,
      maxScore,
      level: "Low",
      summary: "Your answers suggest stress is currently at a manageable level.",
      nextStep: "Keep your routine steady and protect time for rest, movement, and social connection.",
    };
  }

  if (ratio <= 0.5) {
    return {
      score,
      maxScore,
      level: "Mild",
      summary: "You are carrying some stress that may need regular attention.",
      nextStep: "Try short daily resets such as a walk, breathing practice, or screen-free breaks.",
    };
  }

  if (ratio <= 0.75) {
    return {
      score,
      maxScore,
      level: "High",
      summary: "Your stress level looks elevated and may be affecting your day-to-day wellbeing.",
      nextStep: "Reduce non-urgent pressure this week and ask for support from someone you trust.",
    };
  }

  return {
    score,
    maxScore,
    level: "Very high",
    summary: "Your answers suggest stress is very intense right now.",
    nextStep: "Please prioritize support soon, including a mental health professional if available.",
  };
}
