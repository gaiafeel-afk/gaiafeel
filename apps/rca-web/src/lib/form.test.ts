import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_FORM_VALUES, isFormValid, type RcaFormValues, validateRcaForm } from "./form";

function validFormValues(): RcaFormValues {
  const currentYear = new Date().getFullYear();

  return {
    ...DEFAULT_FORM_VALUES,
    county: "Bucuresti",
    locality: "Sector 3",
    firstName: "Andrei",
    lastName: "Ionescu",
    cnp: "1960212123456",
    idSeriesNumber: "RT123456",
    licenseYear: "2012",
    brand: "Dacia",
    model: "Logan",
    engineCc: "1461",
    powerKw: "75",
    maxMassKg: "1450",
    seats: "5",
    vin: "WVWZZZ3CZ9P456456",
    civSeries: "A123456",
    fabricationYear: String(Math.min(currentYear, 2020)),
  };
}

describe("validateRcaForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-02T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks calculation when required fields are invalid", () => {
    const invalid = {
      ...DEFAULT_FORM_VALUES,
      county: "Bucuresti",
      locality: "Sector 1",
      cnp: "1234",
      vin: "short",
      civSeries: "AB12",
      licenseYear: "1940",
      fabricationYear: "1960",
      engineCc: "100",
      powerKw: "2",
      maxMassKg: "100",
      seats: "0",
    };

    const errors = validateRcaForm(invalid);

    expect(errors.cnp).toBeTruthy();
    expect(errors.vin).toBeTruthy();
    expect(errors.civSeries).toBeTruthy();
    expect(errors.licenseYear).toBeTruthy();
    expect(errors.fabricationYear).toBeTruthy();
    expect(errors.engineCc).toBeTruthy();
    expect(errors.powerKw).toBeTruthy();
    expect(errors.maxMassKg).toBeTruthy();
    expect(errors.seats).toBeTruthy();
    expect(isFormValid(errors)).toBe(false);
  });

  it("returns no errors for a valid form payload", () => {
    const errors = validateRcaForm(validFormValues());
    expect(errors).toEqual({});
    expect(isFormValid(errors)).toBe(true);
  });
});
