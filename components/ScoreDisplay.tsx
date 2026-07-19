"use client";

import type { ScoreResult, ScoreError, ScoreBreakdown } from "@/lib/types";

/** The two benchmarks are different statistics, so the score must say which
 *  one it was measured against rather than implying all scores are
 *  comparable. See lib/medianWages.ts. */
const BENCHMARK_SOURCE_LABEL: Record<ScoreBreakdown["benchmarkSource"], string> = {
  user: "your estimate",
  "country-average": "country average",
};

const ERROR_COPY: Record<ScoreError, string> = {
  "missing-salary": "Enter your salary to see a score.",
  "non-positive-hours":
    "Your downtime exceeds your working hours — check those numbers.",
  "invalid-country": "Pick a country to convert your salary.",
  "invalid-work-days":
    "Check your work days and paid leave — they leave no working days in the year.",
  "invalid-number": "Some numbers aren't valid — check for blanks or typos.",
  "benchmark-unavailable":
    "We don't have wage data for your country — enter a typical salary for your role to get a score.",
};

function band(score: number): { label: string; className: string } {
  if (score >= 1.5) return { label: "Excellent", className: "text-green-600" };
  if (score >= 1.15) return { label: "Good", className: "text-emerald-600" };
  if (score >= 0.85) return { label: "About typical", className: "text-gray-700" };
  if (score >= 0.6) return { label: "Below par", className: "text-amber-600" };
  return { label: "Poor", className: "text-red-600" };
}

const money = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function ScoreDisplay({ result }: { result: ScoreResult }) {
  if (!result.ok) {
    return <p className="text-gray-500">{ERROR_COPY[result.reason]}</p>;
  }

  const b = result.breakdown;
  const { label, className } = band(b.score);

  return (
    <div className="space-y-4">
      <div>
        <p data-testid="score-value" className={`text-5xl font-bold ${className}`}>
          {b.score.toFixed(2)}
        </p>
        <p className={`text-sm font-medium ${className}`}>{label}</p>
        <p className="text-xs text-gray-500">
          1.00 means typical for your market.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-gray-500">Total compensation</dt>
        <dd>{money(b.totalComp)}</dd>
        <dt className="text-gray-500">Working days per year</dt>
        <dd>{b.workDaysPerYear}</dd>
        <dt className="text-gray-500">Effective hours per day</dt>
        <dd>{b.effectiveHours.toFixed(2)}</dd>
        <dt className="text-gray-500">Your rate (PPP USD/hour)</dt>
        <dd>{b.rawHourly.toFixed(2)}</dd>
        <dt className="text-gray-500">Conditions multiplier</dt>
        <dd>{b.qualityMultiplier.toFixed(2)}x</dd>
        <dt className="text-gray-500">Benchmark (PPP USD/hour)</dt>
        <dd>
          {b.benchmark.toFixed(2)}{" "}
          <span className="text-xs text-gray-500">
            ({BENCHMARK_SOURCE_LABEL[b.benchmarkSource]})
          </span>
        </dd>
      </dl>
    </div>
  );
}
