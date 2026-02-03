import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculateRcaEstimate } from "../src/calculate";
import type { BonusMalusClass, RcaInput } from "../src/types";

const FIXED_NOW = "2026-02-02T12:00:00.000Z";

function baseInput(overrides: Partial<RcaInput> = {}): RcaInput {
  return {
    personType: "PF",
    county: "Prahova",
    locality: "Ploiesti",
    firstName: "Ion",
    lastName: "Popescu",
    cnp: "1700115123456",
    idSeriesNumber: "PH123456",
    licenseYear: 2005,
    vehicleCategory: "AUTOTURISM",
    brand: "Dacia",
    model: "Logan",
    engineCc: 1400,
    powerKw: 75,
    maxMassKg: 1300,
    seats: 5,
    vin: "UU1234567890",
    civSeries: "AA12345",
    fuelType: "BENZINA",
    vehicleUse: "PERSONAL",
    fabricationYear: 2022,
    bonusMalus: "B0",
    ...overrides,
  };
}

describe("calculateRcaEstimate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates the expected annual premium for 5 risk profiles", () => {
    const currentYear = new Date().getUTCFullYear();

    const profiles: Array<{ input: RcaInput; expected: number }> = [
      {
        input: baseInput({
          cnp: "1700115123456",
          county: "Prahova",
          engineCc: 1100,
          powerKw: 60,
          fuelType: "ELECTRIC",
          bonusMalus: "B8",
          fabricationYear: currentYear - 2,
        }),
        expected: 337,
      },
      {
        input: baseInput({
          cnp: "1920115123456",
          county: "Cluj",
          engineCc: 1600,
          powerKw: 90,
          bonusMalus: "B0",
          fabricationYear: 2019,
        }),
        expected: 1087,
      },
      {
        input: baseInput({
          cnp: "1700115123456",
          county: "Brasov",
          engineCc: 1800,
          powerKw: 120,
          fuelType: "DIESEL",
          vehicleUse: "CURIERAT",
          bonusMalus: "B2",
          fabricationYear: 2016,
        }),
        expected: 1178,
      },
      {
        input: baseInput({
          vehicleCategory: "UTILITARA",
          cnp: "5050701123456",
          county: "Bucuresti",
          locality: "Sector 3",
          engineCc: 2500,
          powerKw: 150,
          seats: 8,
          maxMassKg: 4000,
          vehicleUse: "RIDE_SHARING",
          fuelType: "DIESEL",
          fabricationYear: 2010,
          bonusMalus: "M8",
        }),
        expected: 14422,
      },
      {
        input: baseInput({
          vehicleCategory: "MOTO",
          cnp: "1700115123456",
          county: "Ilfov",
          locality: "Voluntari",
          engineCc: 650,
          powerKw: 42,
          seats: 2,
          maxMassKg: 280,
          fuelType: "BENZINA",
          fabricationYear: 2024,
          bonusMalus: "B3",
        }),
        expected: 497,
      },
    ];

    for (const profile of profiles) {
      const result = calculateRcaEstimate(profile.input);
      expect(result.annualPremiumRon).toBe(profile.expected);
    }
  });

  it("applies bonus and malus multipliers correctly", () => {
    const base = baseInput({
      cnp: "1920115123456",
      county: "Cluj",
      fabricationYear: 2019,
      bonusMalus: "B0",
    });

    const b0 = calculateRcaEstimate(base).annualPremiumRon;
    const b8 = calculateRcaEstimate({ ...base, bonusMalus: "B8" }).annualPremiumRon;
    const m8 = calculateRcaEstimate({ ...base, bonusMalus: "M8" }).annualPremiumRon;

    expect(b8).toBe(543);
    expect(b0).toBe(1087);
    expect(m8).toBe(2174);
    expect(b8).toBeLessThan(b0);
    expect(m8).toBeGreaterThan(b0);
  });

  it("keeps seat multiplier capped and rounds interval values", () => {
    const result = calculateRcaEstimate(
      baseInput({
        seats: 60,
        cnp: "1920115123456",
        county: "Cluj",
        fabricationYear: 2019,
      }),
    );

    const seatFactor = result.breakdown.find((item) => item.factor === "seats");

    expect(seatFactor?.value).toBe(1.15);
    expect(result.annualPremiumRon).toBe(1250);
    expect(result.minRon).toBe(1150);
    expect(result.maxRon).toBe(1350);
  });

  it("uses all bonus malus classes from the public type", () => {
    const classes: BonusMalusClass[] = [
      "B8",
      "B7",
      "B6",
      "B5",
      "B4",
      "B3",
      "B2",
      "B1",
      "B0",
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
      "M6",
      "M7",
      "M8",
    ];

    for (const bonusMalus of classes) {
      const result = calculateRcaEstimate(baseInput({ bonusMalus }));
      expect(result.annualPremiumRon).toBeGreaterThan(0);
    }
  });
});
