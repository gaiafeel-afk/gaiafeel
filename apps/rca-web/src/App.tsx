import { type FormEvent, useMemo, useState } from "react";

import {
  ANSWER_OPTIONS,
  STRESS_QUESTIONS,
  calculateStressResult,
  isEmailValid,
  type StressAnswerValue,
} from "./lib/stressQuiz";

type AnswersByQuestion = Record<string, StressAnswerValue | undefined>;

function levelClassName(level: string): string {
  return level.toLowerCase().replace(/\s+/g, "-");
}

export default function App() {
  const [answers, setAnswers] = useState<AnswersByQuestion>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => calculateStressResult(answers), [answers]);

  const answeredCount = useMemo(
    () => STRESS_QUESTIONS.filter((question) => answers[question.id] !== undefined).length,
    [answers],
  );
  const completion = Math.round((answeredCount / STRESS_QUESTIONS.length) * 100);

  const emailIsValid = isEmailValid(email);
  const hasAllAnswers = answeredCount === STRESS_QUESTIONS.length;
  const canRevealResult = hasAllAnswers && emailIsValid && result !== null;

  function handleAnswerSelect(questionId: string, value: StressAnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setShowResult(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!canRevealResult) {
      setShowResult(false);
      return;
    }

    setShowResult(true);
  }

  function handleReset() {
    setAnswers({});
    setEmail("");
    setSubmitted(false);
    setShowResult(false);
  }

  const showMissingAnswersError = submitted && !hasAllAnswers;
  const showInvalidEmailError = submitted && !emailIsValid;

  return (
    <main className="stress-app">
      <section className="quiz-card">
        <p className="eyebrow">2-minute check-in</p>
        <h1>Stress Calculator Quiz</h1>
        <p className="intro">
          Answer each question in plain everyday language. No technical terms, just a quick
          personal check-in.
        </p>

        <div className="progress-box" role="status" aria-live="polite">
          <div className="progress-label-row">
            <span>Progress</span>
            <strong>
              {answeredCount}/{STRESS_QUESTIONS.length} answered
            </strong>
          </div>
          <div className="progress-track" aria-hidden>
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <form className="quiz-form" onSubmit={handleSubmit} noValidate>
          {STRESS_QUESTIONS.map((question, index) => (
            <fieldset key={question.id} className="question-card">
              <legend>
                {index + 1}. {question.prompt}
              </legend>
              <div className="answer-grid">
                {ANSWER_OPTIONS.map((option) => {
                  const selected = answers[question.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`answer-option${selected ? " selected" : ""}`}
                      onClick={() => handleAnswerSelect(question.id, option.value)}
                      aria-pressed={selected}
                      data-testid={`answer-${question.id}-${option.value}`}
                    >
                      <span>{option.label}</span>
                      <small>{option.description}</small>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="email-area">
            <label htmlFor="email">Email address (required to unlock your result)</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={showInvalidEmailError ? "invalid" : ""}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setShowResult(false);
              }}
              placeholder="you@example.com"
            />
            <p>We only use this to share your stress result summary.</p>
          </div>

          {showMissingAnswersError ? (
            <p className="error-message">Please answer all questions before viewing your result.</p>
          ) : null}
          {showInvalidEmailError ? (
            <p className="error-message">Please enter a valid email address.</p>
          ) : null}

          <div className="action-row">
            <button type="submit" className="primary-button">
              Get my stress result
            </button>
            <button type="button" className="ghost-button" onClick={handleReset}>
              Start over
            </button>
          </div>
        </form>
      </section>

      <aside className="result-card">
        <h2>Your result</h2>
        {!showResult ? (
          <p className="result-placeholder">
            Complete the full quiz and add your email to unlock your personal stress score.
          </p>
        ) : null}

        {showResult && result ? (
          <>
            <p className="score-line">
              Stress score:{" "}
              <strong>
                {result.score}/{result.maxScore}
              </strong>
            </p>
            <div className={`level-badge ${levelClassName(result.level)}`}>{result.level}</div>
            <p className="result-summary">{result.summary}</p>
            <p className="next-step">{result.nextStep}</p>
          </>
        ) : null}

        <p className="disclaimer">
          This quiz is informational only and is not a diagnosis. If stress feels overwhelming,
          reach out to a qualified professional.
        </p>
      </aside>
    </main>
  );
}
