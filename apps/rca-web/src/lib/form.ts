import type { BonusMalusClass, FuelType, PersonType, RcaInput, VehicleCategory, VehicleUse } from "@somatic/rca-engine";

export interface RcaFormValues {
  personType: PersonType;
  county: string;
  locality: string;
  firstName: string;
  lastName: string;
  cnp: string;
  idSeriesNumber: string;
  licenseYear: string;
  vehicleCategory: VehicleCategory;
  brand: string;
  model: string;
  engineCc: string;
  powerKw: string;
  maxMassKg: string;
  seats: string;
  vin: string;
  civSeries: string;
  fuelType: FuelType;
  vehicleUse: VehicleUse;
  fabricationYear: string;
  bonusMalus: BonusMalusClass;
}

export type FormErrors = Partial<Record<keyof RcaFormValues, string>>;

export const DEFAULT_FORM_VALUES: RcaFormValues = {
  personType: "PF",
  county: "",
  locality: "",
  firstName: "",
  lastName: "",
  cnp: "",
  idSeriesNumber: "",
  licenseYear: "",
  vehicleCategory: "AUTOTURISM",
  brand: "",
  model: "",
  engineCc: "",
  powerKw: "",
  maxMassKg: "",
  seats: "",
  vin: "",
  civSeries: "",
  fuelType: "BENZINA",
  vehicleUse: "PERSONAL",
  fabricationYear: "",
  bonusMalus: "B0",
};

function isEmpty(value: string): boolean {
  return value.trim().length === 0;
}

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requireRange(value: string, min: number, max: number): string | null {
  const parsed = parseNumber(value);

  if (parsed === null || !Number.isInteger(parsed)) {
    return `Introdu un numar intreg intre ${min} si ${max}.`;
  }

  if (parsed < min || parsed > max) {
    return `Valoarea trebuie sa fie intre ${min} si ${max}.`;
  }

  return null;
}

export function validateRcaForm(values: RcaFormValues): FormErrors {
  const errors: FormErrors = {};
  const currentYear = new Date().getFullYear();

  if (isEmpty(values.county)) {
    errors.county = "Selecteaza un judet.";
  }

  if (isEmpty(values.locality)) {
    errors.locality = "Selecteaza o localitate sau sector.";
  }

  if (isEmpty(values.firstName)) {
    errors.firstName = "Prenumele este obligatoriu.";
  }

  if (isEmpty(values.lastName)) {
    errors.lastName = "Numele este obligatoriu.";
  }

  if (!/^\d{13}$/.test(values.cnp)) {
    errors.cnp = "CNP-ul trebuie sa aiba exact 13 cifre.";
  }

  if (isEmpty(values.idSeriesNumber)) {
    errors.idSeriesNumber = "Seria si numarul de buletin sunt obligatorii.";
  }

  const licenseYearError = requireRange(values.licenseYear, 1950, currentYear);
  if (licenseYearError) {
    errors.licenseYear = licenseYearError;
  }

  if (isEmpty(values.brand)) {
    errors.brand = "Selecteaza marca.";
  }

  if (isEmpty(values.model)) {
    errors.model = "Selecteaza modelul.";
  }

  const engineError = requireRange(values.engineCc, 600, 7000);
  if (engineError) {
    errors.engineCc = engineError;
  }

  const powerError = requireRange(values.powerKw, 20, 600);
  if (powerError) {
    errors.powerKw = powerError;
  }

  const massError = requireRange(values.maxMassKg, 500, 20000);
  if (massError) {
    errors.maxMassKg = massError;
  }

  const seatsError = requireRange(values.seats, 1, 60);
  if (seatsError) {
    errors.seats = seatsError;
  }

  if (!/^[A-Za-z0-9]{10,17}$/.test(values.vin)) {
    errors.vin = "Seria de sasiu trebuie sa aiba 10-17 caractere alfanumerice.";
  }

  if (values.civSeries.trim().length < 5) {
    errors.civSeries = "Seria cartii trebuie sa aiba minim 5 caractere.";
  }

  const fabricationYearError = requireRange(values.fabricationYear, 1970, currentYear);
  if (fabricationYearError) {
    errors.fabricationYear = fabricationYearError;
  }

  return errors;
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function toRcaInput(values: RcaFormValues): RcaInput {
  return {
    personType: values.personType,
    county: values.county,
    locality: values.locality,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    cnp: values.cnp.trim(),
    idSeriesNumber: values.idSeriesNumber.trim(),
    licenseYear: Number(values.licenseYear),
    vehicleCategory: values.vehicleCategory,
    brand: values.brand,
    model: values.model,
    engineCc: Number(values.engineCc),
    powerKw: Number(values.powerKw),
    maxMassKg: Number(values.maxMassKg),
    seats: Number(values.seats),
    vin: values.vin.trim().toUpperCase(),
    civSeries: values.civSeries.trim().toUpperCase(),
    fuelType: values.fuelType,
    vehicleUse: values.vehicleUse,
    fabricationYear: Number(values.fabricationYear),
    bonusMalus: values.bonusMalus,
  };
}
