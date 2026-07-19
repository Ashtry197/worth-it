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

/** The gauge runs 0 to 2x the benchmark. Beyond that the needle pins and the
 *  readout carries the real figure — a scale that rescales isn't a scale. */
const GAUGE_MAX = 2;
const TICKS = [0, 0.5, 1, 1.5, 2];

function band(score: number): { label: string; tone: string } {
  if (score >= 1.5) return { label: "Well above market", tone: "text-moss" };
  if (score >= 1.15) return { label: "Above market", tone: "text-moss" };
  if (score >= 0.85) return { label: "About typical", tone: "text-ink" };
  if (score >= 0.6) return { label: "Below market", tone: "text-rust" };
  return { label: "Well below market", tone: "text-rust" };
}

const money = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

function Gauge({ score, tone }: { score: number; tone: string }) {
  const pinned = score > GAUGE_MAX;
  const position = Math.min(Math.max(score / GAUGE_MAX, 0), 1) * 100;

  const needleTone =
    tone === "text-rust"
      ? "bg-rust"
      : tone === "text-moss"
        ? "bg-moss"
        : "bg-cobalt";

  return (
    // Inset so the 0.0 and 2.0 marks — and their labels — sit inside the
    // card rather than being clipped at its edge.
    <div className="px-3 pt-6">
      <div className="relative h-11">
        {/* the scale */}
        <div className="absolute inset-x-0 top-2 h-px bg-rule" />

        {TICKS.map((t) => {
          const datum = t === 1;
          return (
            <div
              key={t}
              className="absolute top-2 -translate-x-1/2"
              style={{ left: `${(t / GAUGE_MAX) * 100}%` }}
            >
              <div
                className={datum ? "h-2.5 w-px bg-ink" : "h-1.5 w-px bg-rule"}
              />
              <span
                className={`tnum absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.625rem] ${
                  datum ? "top-3.5 text-ink" : "top-2.5 text-graphite"
                }`}
              >
                {t === GAUGE_MAX ? "2.0+" : t.toFixed(1)}
              </span>
              {datum && (
                <span className="eyebrow absolute top-7 left-1/2 -translate-x-1/2 text-[0.5625rem] whitespace-nowrap">
                  market
                </span>
              )}
            </div>
          );
        })}

        {/* the needle — a marker on the scale, carrying no text of its own */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <div className={`h-4 w-[3px] rounded-full ${needleTone}`} />
          {pinned && (
            <span className={`absolute -top-0.5 left-2 text-[0.625rem] ${tone}`}>
              ›
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule/60 py-2 last:border-0">
      <dt className="text-sm text-graphite">{term}</dt>
      <dd className="tnum text-sm text-ink">{children}</dd>
    </div>
  );
}

export function ScoreDisplay({ result }: { result: ScoreResult }) {
  if (!result.ok) {
    return (
      <div
        aria-live="polite"
        aria-atomic="true"
        className="rounded-lg border border-dashed border-rule bg-card/60 p-6"
      >
        <p className="eyebrow mb-2">No reading</p>
        <p className="text-sm text-graphite">{ERROR_COPY[result.reason]}</p>
      </div>
    );
  }

  const b = result.breakdown;
  const { label, tone } = band(b.score);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="rounded-lg border border-rule bg-card p-6 shadow-[0_1px_0_rgba(22,28,23,0.04)]"
    >
      <p className="eyebrow">Your rate against the market</p>

      {/* The score is the thing they came for, so it leads and never hides
          behind a placeholder — an earlier version showed "2+" large with the
          real figure in small text, which buried the answer. */}
      {/* Display face, not the mono .tnum used elsewhere: at hero size the
          monospace decimal point floats in its own wide cell and reads as
          "2 . 84". The ledger rows below keep mono, where columns must align. */}
      <p
        data-testid="score-value"
        className={`mt-3 font-display text-6xl leading-none font-semibold tracking-tight sm:text-7xl ${tone}`}
      >
        {b.score.toFixed(2)}
      </p>
      <p className={`mt-2 font-display text-lg ${tone}`}>{label}</p>
      <p className="mt-1 text-xs text-graphite">
        1.00 means typical for your market.
      </p>

      <Gauge score={b.score} tone={tone} />

      <dl className="mt-6 border-t border-rule pt-2">
        <Row term="Total compensation (local currency)">{money(b.totalComp)}</Row>
        <Row term="Working days per year">{b.workDaysPerYear}</Row>
        <Row term="Effective hours per day">{b.effectiveHours.toFixed(2)}</Row>
        <Row term="Your rate (PPP USD/hour)">{b.rawHourly.toFixed(2)}</Row>
        <Row term="Conditions multiplier">{b.qualityMultiplier.toFixed(2)}x</Row>
        <Row term="Benchmark (PPP USD/hour)">
          {b.benchmark.toFixed(2)}{" "}
          <span className="font-sans text-xs text-graphite">
            ({BENCHMARK_SOURCE_LABEL[b.benchmarkSource]})
          </span>
        </Row>
      </dl>
    </div>
  );
}
