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

  return (
    <div className="pt-10">
      {/* Readout rides above the needle rather than sitting apart from it. */}
      <div
        className="relative h-12 transition-[margin] duration-500 ease-out"
        style={{ marginLeft: `${position}%` }}
      >
        <div className="absolute bottom-0 -translate-x-1/2 text-center whitespace-nowrap">
          <span
            data-testid="score-value"
            className={`tnum block text-4xl leading-none font-semibold sm:text-5xl ${tone}`}
          >
            {pinned ? "2+" : score.toFixed(2)}
          </span>
          <span className={`mt-1 block text-[0.6875rem] tracking-wide ${tone}`}>
            {pinned ? score.toFixed(2) : ""}
          </span>
        </div>
      </div>

      <div className="relative h-9">
        {/* the scale */}
        <div className="absolute inset-x-0 top-0 h-px bg-rule" />

        {/* the datum — the whole point of the instrument */}
        <div className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-ink" />
        <span className="eyebrow absolute top-4 left-1/2 -translate-x-1/2 text-ink">
          1.00 · market
        </span>

        {TICKS.filter((t) => t !== 1).map((t) => (
          <div
            key={t}
            className="absolute top-0 w-px bg-rule"
            style={{ left: `${(t / GAUGE_MAX) * 100}%`, height: "0.5rem" }}
          >
            <span className="tnum absolute top-2.5 left-1/2 -translate-x-1/2 text-[0.625rem] text-graphite">
              {t.toFixed(1)}
            </span>
          </div>
        ))}

        {/* the needle */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-[left] duration-500 ease-out"
          style={{ left: `${position}%` }}
        >
          <div
            className={`h-5 w-0.5 ${
              tone === "text-rust"
                ? "bg-rust"
                : tone === "text-moss"
                  ? "bg-moss"
                  : "bg-cobalt"
            }`}
          />
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

      <Gauge score={b.score} tone={tone} />

      <p className={`mt-8 font-display text-lg ${tone}`}>{label}</p>
      <p className="mt-1 text-xs text-graphite">
        1.00 means typical for your market.
      </p>

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
