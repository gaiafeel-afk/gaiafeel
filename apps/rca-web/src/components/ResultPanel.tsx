import type { RcaResult } from "@somatic/rca-engine";

interface ResultPanelProps {
  result: RcaResult | null;
  isValid: boolean;
}

const FACTOR_LABELS: Record<string, string> = {
  basePremiumRon: "Prima de baza",
  age: "Factor varsta",
  county: "Factor judet",
  engine: "Factor cilindree",
  power: "Factor putere",
  usage: "Factor destinatie auto",
  seats: "Factor locuri",
  mass: "Factor masa maxima",
  fuel: "Factor carburant",
  vehicleAge: "Factor vechime auto",
  bonusMalus: "Factor bonus/malus",
};

function formatRon(value: number): string {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function formatFactor(value: number): string {
  return `x${value.toFixed(2)}`;
}

export function ResultPanel({ result, isValid }: ResultPanelProps) {
  return (
    <aside className="result-card">
      <h2>Pret estimat RCA</h2>
      {!isValid ? (
        <p className="result-placeholder">Completeaza toate campurile valide pentru a vedea pretul estimat.</p>
      ) : null}
      {isValid && !result ? <p className="result-placeholder">Calculam oferta orientativa...</p> : null}

      {result ? (
        <>
          <div className="result-amount">
            <span>Pret estimat anual</span>
            <strong>{formatRon(result.annualPremiumRon)} RON</strong>
          </div>

          <div className="result-interval">
            Interval estimativ: {formatRon(result.minRon)} - {formatRon(result.maxRon)} RON
          </div>

          <ul className="breakdown-list">
            {result.breakdown.map((item) => (
              <li key={item.factor}>
                <span>{FACTOR_LABELS[item.factor] ?? item.factor}</span>
                <strong>
                  {item.factor === "basePremiumRon"
                    ? `${formatRon(item.value)} RON`
                    : formatFactor(item.value)}
                </strong>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="disclaimer">
        Estimare orientativa, nu oferta contractuala. Pretul final poate varia in functie de
        asigurator si reguli comerciale.
      </p>
    </aside>
  );
}
