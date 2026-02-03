export type PersonType = "PF" | "PJ";

export type VehicleCategory = "AUTOTURISM" | "MOTO" | "UTILITARA";

export type FuelType = "BENZINA" | "DIESEL" | "GPL" | "HIBRID" | "ELECTRIC";

export type VehicleUse = "PERSONAL" | "RIDE_SHARING" | "CURIERAT";

export type BonusMalusClass =
  | "B8"
  | "B7"
  | "B6"
  | "B5"
  | "B4"
  | "B3"
  | "B2"
  | "B1"
  | "B0"
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "M7"
  | "M8";

export interface RcaInput {
  personType: PersonType;
  county: string;
  locality: string;
  firstName: string;
  lastName: string;
  cnp: string;
  idSeriesNumber: string;
  licenseYear: number;
  vehicleCategory: VehicleCategory;
  brand: string;
  model: string;
  engineCc: number;
  powerKw: number;
  maxMassKg: number;
  seats: number;
  vin: string;
  civSeries: string;
  fuelType: FuelType;
  vehicleUse: VehicleUse;
  fabricationYear: number;
  bonusMalus: BonusMalusClass;
}

export interface RcaResult {
  annualPremiumRon: number;
  minRon: number;
  maxRon: number;
  breakdown: Array<{ factor: string; value: number }>;
}
