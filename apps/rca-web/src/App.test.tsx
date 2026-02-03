import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Judet/i), { target: { value: "Bucuresti" } });
  fireEvent.change(screen.getByLabelText(/Localitate \/ sector/i), { target: { value: "Sector 3" } });
  fireEvent.change(screen.getByLabelText(/^Nume asigurat$/i), { target: { value: "Popescu" } });
  fireEvent.change(screen.getByLabelText(/^Prenume asigurat$/i), { target: { value: "Andrei" } });
  fireEvent.change(screen.getByLabelText(/^CNP asigurat$/i), { target: { value: "1960212123456" } });
  fireEvent.change(screen.getByLabelText(/Serie si nr\. buletin/i), { target: { value: "RT123456" } });
  fireEvent.change(screen.getByLabelText(/Permis din anul/i), { target: { value: "2010" } });

  fireEvent.change(screen.getByLabelText(/Marca/i), { target: { value: "Dacia" } });
  fireEvent.change(screen.getByLabelText(/^Model$/i), { target: { value: "Logan" } });
  fireEvent.change(screen.getByLabelText(/Cilindree/i), { target: { value: "1461" } });
  fireEvent.change(screen.getByLabelText(/Putere/i), { target: { value: "70" } });
  fireEvent.change(screen.getByLabelText(/Masa maxima/i), { target: { value: "1450" } });
  fireEvent.change(screen.getByLabelText(/Locuri/i), { target: { value: "5" } });
  fireEvent.change(screen.getByLabelText(/Serie sasiu/i), { target: { value: "WVWZZZ3CZ9P456456" } });
  fireEvent.change(screen.getByLabelText(/Serie carte/i), { target: { value: "A123456" } });
  fireEvent.change(screen.getByLabelText(/An fabricatie/i), { target: { value: "2019" } });
}

describe("RCA App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-02T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the RCA form and keeps CTA disabled while invalid", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Calculeaza in timp real/i })).toBeInTheDocument();
    const ctaButtons = screen.getAllByRole("button", { name: /AFLA PRETUL/i });
    expect(ctaButtons.every((button) => button.hasAttribute("disabled"))).toBe(true);
  });

  it("updates the estimated premium after valid changes", () => {
    render(<App />);
    fillValidForm();

    const ctaButtons = screen.getAllByRole("button", { name: /AFLA PRETUL/i });
    expect(ctaButtons.some((button) => !button.hasAttribute("disabled"))).toBe(true);

    act(() => {
      vi.advanceTimersByTime(170);
    });

    expect(screen.getByText(/Pret estimat anual/i)).toBeInTheDocument();
    expect(screen.getByText(/Interval estimativ/i)).toBeInTheDocument();
  });
});
