import type { BonusMalusClass, FuelType, PersonType, VehicleCategory, VehicleUse } from "@somatic/rca-engine";

import { BRAND_OPTIONS, getModelsForBrand } from "../data/brands";
import { COUNTY_OPTIONS, getLocalitiesForCounty } from "../data/counties";
import type { FormErrors, RcaFormValues } from "../lib/form";

interface RcaFormProps {
  values: RcaFormValues;
  errors: FormErrors;
  onFieldChange: <K extends keyof RcaFormValues>(field: K, value: RcaFormValues[K]) => void;
  isValid: boolean;
  onCalculate: () => void;
}

const PERSON_TYPES: Array<{ value: PersonType; label: string }> = [
  { value: "PF", label: "Persoana fizica" },
  { value: "PJ", label: "Persoana juridica" },
];

const VEHICLE_CATEGORIES: Array<{ value: VehicleCategory; label: string }> = [
  { value: "AUTOTURISM", label: "Autoturism" },
  { value: "MOTO", label: "Moto" },
  { value: "UTILITARA", label: "Utilitara" },
];

const FUEL_TYPES: Array<{ value: FuelType; label: string }> = [
  { value: "BENZINA", label: "Benzina" },
  { value: "DIESEL", label: "Diesel" },
  { value: "GPL", label: "GPL" },
  { value: "HIBRID", label: "Hibrid" },
  { value: "ELECTRIC", label: "Electric" },
];

const VEHICLE_USES: Array<{ value: VehicleUse; label: string }> = [
  { value: "PERSONAL", label: "Personal" },
  { value: "CURIERAT", label: "Curierat" },
  { value: "RIDE_SHARING", label: "Ride sharing" },
];

const BONUS_MALUS_VALUES: BonusMalusClass[] = [
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

function FieldError({ value }: { value?: string }) {
  if (!value) {
    return null;
  }

  return <p className="field-error">{value}</p>;
}

export function RcaForm({ values, errors, onFieldChange, isValid, onCalculate }: RcaFormProps) {
  const localities = getLocalitiesForCounty(values.county);
  const models = getModelsForBrand(values.brand);

  return (
    <div className="form-wrapper">
      <div className="headline-card">
        <h1>Calculeaza in timp real pretul unei asigurari RCA</h1>
        <p>Estimator demo pentru tarif anual RCA, pe baza datelor introduse.</p>
      </div>

      <section className="section-card">
        <div className="section-title-row">
          <h2>Date asigurat</h2>
        </div>
        <div className="form-grid two-columns">
          <div className="field">
            <label htmlFor="personType">Tip persoana</label>
            <select
              id="personType"
              value={values.personType}
              onChange={(event) => onFieldChange("personType", event.target.value as PersonType)}
            >
              {PERSON_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="county">Judet</label>
            <select
              id="county"
              className={errors.county ? "invalid" : ""}
              value={values.county}
              onChange={(event) => onFieldChange("county", event.target.value)}
            >
              <option value="">Alege...</option>
              {COUNTY_OPTIONS.map((option) => (
                <option key={option.county} value={option.county}>
                  {option.county}
                </option>
              ))}
            </select>
            <FieldError value={errors.county} />
          </div>

          <div className="field">
            <label htmlFor="locality">Localitate / sector</label>
            <select
              id="locality"
              className={errors.locality ? "invalid" : ""}
              value={values.locality}
              onChange={(event) => onFieldChange("locality", event.target.value)}
            >
              <option value="">Alege...</option>
              {localities.map((locality) => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
            <FieldError value={errors.locality} />
          </div>

          <div className="field">
            <label htmlFor="lastName">Nume asigurat</label>
            <input
              id="lastName"
              className={errors.lastName ? "invalid" : ""}
              value={values.lastName}
              onChange={(event) => onFieldChange("lastName", event.target.value)}
              placeholder="Introduceti numele asiguratului"
            />
            <FieldError value={errors.lastName} />
          </div>

          <div className="field">
            <label htmlFor="firstName">Prenume asigurat</label>
            <input
              id="firstName"
              className={errors.firstName ? "invalid" : ""}
              value={values.firstName}
              onChange={(event) => onFieldChange("firstName", event.target.value)}
              placeholder="Introduceti prenumele asiguratului"
            />
            <FieldError value={errors.firstName} />
          </div>

          <div className="field">
            <label htmlFor="cnp">CNP asigurat</label>
            <input
              id="cnp"
              className={errors.cnp ? "invalid" : ""}
              value={values.cnp}
              onChange={(event) => onFieldChange("cnp", event.target.value.replace(/\D/g, ""))}
              placeholder="Introduceti CNP asigurat"
              inputMode="numeric"
            />
            <FieldError value={errors.cnp} />
          </div>

          <div className="field">
            <label htmlFor="idSeriesNumber">Serie si nr. buletin</label>
            <input
              id="idSeriesNumber"
              className={errors.idSeriesNumber ? "invalid" : ""}
              value={values.idSeriesNumber}
              onChange={(event) => onFieldChange("idSeriesNumber", event.target.value)}
              placeholder="Ex: RT123456"
            />
            <FieldError value={errors.idSeriesNumber} />
          </div>

          <div className="field">
            <label htmlFor="licenseYear">Permis din anul</label>
            <input
              id="licenseYear"
              className={errors.licenseYear ? "invalid" : ""}
              value={values.licenseYear}
              onChange={(event) => onFieldChange("licenseYear", event.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 1988"
              inputMode="numeric"
            />
            <FieldError value={errors.licenseYear} />
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title-row">
          <h2>Date autoturism</h2>
        </div>

        <div className="form-grid two-columns">
          <div className="field">
            <label htmlFor="vehicleCategory">Categorie vehicul</label>
            <select
              id="vehicleCategory"
              value={values.vehicleCategory}
              onChange={(event) =>
                onFieldChange("vehicleCategory", event.target.value as VehicleCategory)
              }
            >
              {VEHICLE_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="brand">Marca</label>
            <select
              id="brand"
              className={errors.brand ? "invalid" : ""}
              value={values.brand}
              onChange={(event) => onFieldChange("brand", event.target.value)}
            >
              <option value="">Alege...</option>
              {BRAND_OPTIONS.map((option) => (
                <option key={option.brand} value={option.brand}>
                  {option.brand}
                </option>
              ))}
            </select>
            <FieldError value={errors.brand} />
          </div>

          <div className="field">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              className={errors.model ? "invalid" : ""}
              value={values.model}
              onChange={(event) => onFieldChange("model", event.target.value)}
            >
              <option value="">Alege...</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <FieldError value={errors.model} />
          </div>

          <div className="field">
            <label htmlFor="engineCc">Cilindree</label>
            <input
              id="engineCc"
              className={errors.engineCc ? "invalid" : ""}
              value={values.engineCc}
              onChange={(event) => onFieldChange("engineCc", event.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 1461"
              inputMode="numeric"
            />
            <FieldError value={errors.engineCc} />
          </div>

          <div className="field">
            <label htmlFor="powerKw">Putere (kW)</label>
            <input
              id="powerKw"
              className={errors.powerKw ? "invalid" : ""}
              value={values.powerKw}
              onChange={(event) => onFieldChange("powerKw", event.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 63"
              inputMode="numeric"
            />
            <FieldError value={errors.powerKw} />
          </div>

          <div className="field">
            <label htmlFor="maxMassKg">Masa maxima (kg)</label>
            <input
              id="maxMassKg"
              className={errors.maxMassKg ? "invalid" : ""}
              value={values.maxMassKg}
              onChange={(event) => onFieldChange("maxMassKg", event.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 1650"
              inputMode="numeric"
            />
            <FieldError value={errors.maxMassKg} />
          </div>

          <div className="field">
            <label htmlFor="seats">Locuri</label>
            <input
              id="seats"
              className={errors.seats ? "invalid" : ""}
              value={values.seats}
              onChange={(event) => onFieldChange("seats", event.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 5"
              inputMode="numeric"
            />
            <FieldError value={errors.seats} />
          </div>

          <div className="field">
            <label htmlFor="vin">Serie sasiu</label>
            <input
              id="vin"
              className={errors.vin ? "invalid" : ""}
              value={values.vin}
              onChange={(event) => onFieldChange("vin", event.target.value.toUpperCase())}
              placeholder="Ex: WVWZZZ3CZ9P456456"
            />
            <FieldError value={errors.vin} />
          </div>

          <div className="field">
            <label htmlFor="civSeries">Serie carte</label>
            <input
              id="civSeries"
              className={errors.civSeries ? "invalid" : ""}
              value={values.civSeries}
              onChange={(event) => onFieldChange("civSeries", event.target.value.toUpperCase())}
              placeholder="Ex: A123456"
            />
            <FieldError value={errors.civSeries} />
          </div>

          <div className="field">
            <label htmlFor="fuelType">Carburant</label>
            <select
              id="fuelType"
              value={values.fuelType}
              onChange={(event) => onFieldChange("fuelType", event.target.value as FuelType)}
            >
              {FUEL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="vehicleUse">Auto destinat pentru</label>
            <select
              id="vehicleUse"
              value={values.vehicleUse}
              onChange={(event) => onFieldChange("vehicleUse", event.target.value as VehicleUse)}
            >
              {VEHICLE_USES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="fabricationYear">An fabricatie</label>
            <input
              id="fabricationYear"
              className={errors.fabricationYear ? "invalid" : ""}
              value={values.fabricationYear}
              onChange={(event) => onFieldChange("fabricationYear", event.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 2017"
              inputMode="numeric"
            />
            <FieldError value={errors.fabricationYear} />
          </div>

          <div className="field">
            <label htmlFor="bonusMalus">Clasa bonus / malus</label>
            <select
              id="bonusMalus"
              value={values.bonusMalus}
              onChange={(event) =>
                onFieldChange("bonusMalus", event.target.value as BonusMalusClass)
              }
            >
              {BONUS_MALUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cta-row">
          <button type="button" className="cta-button" onClick={onCalculate} disabled={!isValid}>
            AFLA PRETUL
          </button>
        </div>
      </section>
    </div>
  );
}
