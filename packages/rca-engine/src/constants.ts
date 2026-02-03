import type { BonusMalusClass, VehicleCategory, VehicleUse } from "./types";

export const BASE_PREMIUM_BY_CATEGORY: Record<VehicleCategory, number> = {
  AUTOTURISM: 900,
  MOTO: 550,
  UTILITARA: 1100,
};

export const BONUS_MALUS_FACTORS: Record<BonusMalusClass, number> = {
  B8: 0.5,
  B7: 0.6,
  B6: 0.7,
  B5: 0.75,
  B4: 0.8,
  B3: 0.85,
  B2: 0.9,
  B1: 0.95,
  B0: 1,
  M1: 1.1,
  M2: 1.2,
  M3: 1.3,
  M4: 1.4,
  M5: 1.5,
  M6: 1.65,
  M7: 1.8,
  M8: 2,
};

export const VEHICLE_USE_FACTORS: Record<VehicleUse, number> = {
  PERSONAL: 1,
  CURIERAT: 1.2,
  RIDE_SHARING: 1.45,
};

export const HIGH_RISK_COUNTIES = new Set(["BUCURESTI", "ILFOV"]);

export const MEDIUM_RISK_COUNTIES = new Set(["CLUJ", "TIMIS", "IASI", "CONSTANTA"]);
