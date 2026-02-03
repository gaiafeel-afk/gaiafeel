import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "./App";
import { STRESS_QUESTIONS } from "./lib/stressQuiz";

function answerAllQuestions(value: number = 2) {
  STRESS_QUESTIONS.forEach((question) => {
    fireEvent.click(screen.getByTestId(`answer-${question.id}-${value}`));
  });
}

afterEach(() => {
  cleanup();
});

describe("Stress calculator app", () => {
  it("renders the quiz heading and progress area", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Stress Calculator Quiz/i })).toBeInTheDocument();
    expect(screen.getByText(/Progress/i)).toBeInTheDocument();
  });

  it("requires an email address before showing result", () => {
    render(<App />);
    answerAllQuestions();

    fireEvent.click(screen.getByRole("button", { name: /Get my stress result/i }));

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.queryByText(/Stress score:/i)).not.toBeInTheDocument();
  });

  it("shows the stress score when answers and email are valid", () => {
    render(<App />);
    answerAllQuestions(3);

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Get my stress result/i }));

    expect(screen.getByText(/Stress score:/i)).toBeInTheDocument();
    expect(screen.getByText(/Very high/i)).toBeInTheDocument();
  });
});
