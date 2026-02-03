import { BASE_PREMIUM_BY_CATEGORY, BONUS_MALUS_FACTORS, HIGH_RISK_COUNTIES, MEDIUM_RISK_COUNTIES, VEHICLE_USE_FACTORS } from "./constants";
import type { RcaInput, RcaResult } from "./types";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function getBirthDateFromCnp(cnp: string, referenceDate: Date): Date | null {
  if (!/^\d{13}$/.test(cnp)) {
    return null;
  }

  const sexCentury = Number(cnp[0]);
  const yy = Number(cnp.slice(1, 3));
  const mm = Number(cnp.slice(3, 5));
  const dd = Number(cnp.slice(5, 7));

  const centuryByPrefix: Record<number, number> = {
    1: 1900,
    2: 1900,
    3: 1800,
    4: 1800,
    5: 2000,
    6: 2000,
    7: 2000,
    8: 2000,
    9: 2000,
  };

  const baseCentury = centuryByPrefix[sexCentury];
  if (!baseCentury || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return null;
  }

  let year = baseCentury + yy;
  if (year > referenceDate.getUTCFullYear()) {
    year -= 100;
  }

  const birthDate = new Date(Date.UTC(year, mm - 1, dd));
  if (
    birthDate.getUTCFullYear() !== year ||
    birthDate.getUTCMonth() !== mm - 1 ||
    birthDate.getUTCDate() !== dd
  ) {
    return null;
  }

  return birthDate;
}

function getAgeFromCnp(cnp: string, referenceDate: Date): number | null {
  const birthDate = getBirthDateFromCnp(cnp, referenceDate);
  if (!birthDate) {
    return null;
  }

  let age = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasBirthdayPassed =
    referenceDate.getUTCMonth() > birthDate.getUTCMonth() ||
    (referenceDate.getUTCMonth() === birthDate.getUTCMonth() &&
      referenceDate.getUTCDate() >= birthDate.getUTCDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function getAgeFactor(age: number | null): number {
  if (age === null) {
    return 1;
  }

  if (age < 25) {
    return 1.35;
  }

  if (age <= 30) {
    return 1.2;
  }

  if (age <= 45) {
    return 1;
  }

  if (age <= 60) {
    return 0.92;
  }

  return 0.98;
}

function getCountyFactor(county: string): number {
  const normalizedCounty = normalizeText(county);

  if (HIGH_RISK_COUNTIES.has(normalizedCounty)) {
    return 1.35;
  }

  if (MEDIUM_RISK_COUNTIES.has(normalizedCounty)) {
    return 1.15;
  }

  return 1;
}

function getEngineFactor(engineCc: number): number {
  if (engineCc <= 1200) {
    return 0.92;
  }

  if (engineCc <= 1600) {
    return 1;
  }

  if (engineCc <= 2000) {
    return 1.12;
  }

  return 1.27;
}

function getPowerFactor(powerKw: number): number {
  if (powerKw <= 70) {
    return 0.93;
  }

  if (powerKw <= 100) {
    return 1;
  }

  if (powerKw <= 130) {
    return 1.12;
  }

  return 1.28;
}

function getSeatsFactor(seats: number): number {
  if (seats <= 5) {
    return 1;
  }

  return Math.min(1.15, 1 + (seats - 5) * 0.03);
}

function getMassFactor(maxMassKg: number): number {
  return maxMassKg <= 3500 ? 1 : 1.25;
}

function getFuelFactor(fuelType: RcaInput["fuelType"]): number {
  if (fuelType === "ELECTRIC") {
    return 0.95;
  }

  if (fuelType === "HIBRID") {
    return 0.98;
  }

  return 1;
}

function getVehicleAgeFactor(fabricationYear: number, referenceDate: Date): number {
  const vehicleAge = Math.max(0, referenceDate.getUTCFullYear() - fabricationYear);

  if (vehicleAge <= 5) {
    return 1;
  }

  if (vehicleAge <= 10) {
    return 1.05;
  }

  return 1.12;
}

export function calculateRcaEstimate(input: RcaInput): RcaResult {
  const now = new Date();

  const factors = {
    age: getAgeFactor(getAgeFromCnp(input.cnp, now)),
    county: getCountyFactor(input.county),
    engine: getEngineFactor(input.engineCc),
    power: getPowerFactor(input.powerKw),
    usage: VEHICLE_USE_FACTORS[input.vehicleUse],
    seats: getSeatsFactor(input.seats),
    mass: getMassFactor(input.maxMassKg),
    fuel: getFuelFactor(input.fuelType),
    vehicleAge: getVehicleAgeFactor(input.fabricationYear, now),
    bonusMalus: BONUS_MALUS_FACTORS[input.bonusMalus],
  };

  const basePremium = BASE_PREMIUM_BY_CATEGORY[input.vehicleCategory];
  const premiumRaw =
    basePremium *
    factors.age *
    factors.county *
    factors.engine *
    factors.power *
    factors.usage *
    factors.seats *
    factors.mass *
    factors.fuel *
    factors.vehicleAge *
    factors.bonusMalus;

  const annualPremiumRon = Math.round(premiumRaw);

  return {
    annualPremiumRon,
    minRon: Math.round(annualPremiumRon * 0.92),
    maxRon: Math.round(annualPremiumRon * 1.08),
    breakdown: [
      { factor: "basePremiumRon", value: basePremium },
      { factor: "age", value: factors.age },
      { factor: "county", value: factors.county },
      { factor: "engine", value: factors.engine },
      { factor: "power", value: factors.power },
      { factor: "usage", value: factors.usage },
      { factor: "seats", value: factors.seats },
      { factor: "mass", value: factors.mass },
      { factor: "fuel", value: factors.fuel },
      { factor: "vehicleAge", value: factors.vehicleAge },
      { factor: "bonusMalus", value: factors.bonusMalus },
    ],
  };
}
