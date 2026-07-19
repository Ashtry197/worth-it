import type { JobInput, ScoreResult } from "@/lib/types";
import { pppFactors, toPppUsd } from "@/lib/ppp";
import { resolveBenchmark } from "@/lib/benchmark";
import { WEEKS_PER_YEAR } from "@/lib/constants";

/** Every numeric field, checked before anything else. NaN defeats ordinary
 *  range guards silently — `NaN <= 0` is false, so a NaN would pass every
 *  check below and surface as `{ ok: true, score: NaN }`. */
const NUMERIC_FIELDS = [
  "salary",
  "employerHealthcare",
  "pensionMatch",
  "workHoursPerDay",
  "workDaysPerWeek",
  "remoteDaysPerWeek",
  "commuteHoursPerDay",
  "ptoDays",
  "restHoursPerDay",
  "environment",
  "management",
  "colleagues",
  "yearsExperience",
] as const satisfies ReadonlyArray<keyof JobInput>;

export function calculateScore(input: JobInput): ScoreResult {
  for (const field of NUMERIC_FIELDS) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return { ok: false, reason: "invalid-number" };
    }
  }
  if (
    input.expectedSalary !== null &&
    (!Number.isFinite(input.expectedSalary) || input.expectedSalary < 0)
  ) {
    return { ok: false, reason: "invalid-number" };
  }

  if (!input.salary || input.salary <= 0) {
    return { ok: false, reason: "missing-salary" };
  }
  // hasOwnProperty, not a bare lookup: pppFactors["constructor"] would
  // otherwise return an inherited function and pass as a valid country.
  if (!Object.prototype.hasOwnProperty.call(pppFactors, input.country)) {
    return { ok: false, reason: "invalid-country" };
  }
  if (input.workDaysPerWeek <= 0) {
    return { ok: false, reason: "invalid-work-days" };
  }

  const workDaysPerYear =
    WEEKS_PER_YEAR * input.workDaysPerWeek - input.ptoDays;
  if (workDaysPerYear <= 0) {
    return { ok: false, reason: "invalid-work-days" };
  }

  // Money is counted as money.
  const totalComp =
    input.salary + input.employerHealthcare + input.pensionMatch;

  // Remote days act only here, reducing commute exposure.
  const remoteDays = Math.min(
    Math.max(input.remoteDaysPerWeek, 0),
    input.workDaysPerWeek,
  );
  const officeDaysRatio =
    (input.workDaysPerWeek - remoteDays) / input.workDaysPerWeek;

  const effectiveHours =
    input.workHoursPerDay +
    input.commuteHoursPerDay * officeDaysRatio -
    0.5 * input.restHoursPerDay;

  if (effectiveHours <= 0) {
    return { ok: false, reason: "non-positive-hours" };
  }

  const adjustedDailyPay = toPppUsd(totalComp, input.country) / workDaysPerYear;
  const rawHourly = adjustedDailyPay / effectiveHours;

  const qualityMultiplier =
    input.environment * input.management * input.colleagues;

  const resolvedBenchmark = resolveBenchmark(input);
  if (resolvedBenchmark === null) {
    return { ok: false, reason: "benchmark-unavailable" };
  }
  const { hourly: benchmark, source: benchmarkSource } = resolvedBenchmark;

  const score = (rawHourly * qualityMultiplier) / benchmark;

  return {
    ok: true,
    breakdown: {
      totalComp,
      workDaysPerYear,
      officeDaysRatio,
      adjustedDailyPay,
      effectiveHours,
      rawHourly,
      qualityMultiplier,
      benchmark,
      benchmarkSource,
      score,
    },
  };
}
