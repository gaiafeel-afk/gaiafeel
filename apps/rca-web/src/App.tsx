import { calculateRcaEstimate, type RcaResult } from "@somatic/rca-engine";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RcaForm } from "./components/RcaForm";
import { ResultPanel } from "./components/ResultPanel";
import { DEFAULT_FORM_VALUES, isFormValid, toRcaInput, type RcaFormValues, validateRcaForm } from "./lib/form";

export default function App() {
  const [values, setValues] = useState<RcaFormValues>(DEFAULT_FORM_VALUES);
  const [result, setResult] = useState<RcaResult | null>(null);

  const errors = useMemo(() => validateRcaForm(values), [values]);
  const valid = isFormValid(errors);

  useEffect(() => {
    if (!valid) {
      setResult(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      setResult(calculateRcaEstimate(toRcaInput(values)));
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [valid, values]);

  const handleFieldChange = useCallback(
    <K extends keyof RcaFormValues,>(field: K, value: RcaFormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value } as RcaFormValues;

        if (field === "county") {
          next.locality = "";
        }

        if (field === "brand") {
          next.model = "";
        }

        return next;
      });
    },
    [],
  );

  const handleCalculate = useCallback(() => {
    if (!valid) {
      return;
    }

    setResult(calculateRcaEstimate(toRcaInput(values)));
  }, [valid, values]);

  return (
    <main className="app-shell">
      <RcaForm
        values={values}
        errors={errors}
        onFieldChange={handleFieldChange}
        isValid={valid}
        onCalculate={handleCalculate}
      />
      <ResultPanel result={result} isValid={valid} />
    </main>
  );
}
