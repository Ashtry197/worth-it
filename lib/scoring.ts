import type { JobInput, ScoreResult } from "@/lib/types";
import { pppFactors, toPppUsd } from "@/lib/ppp";
import { resolveBenchmark } from "@/lib/benchmark";
import { WEEKS_PER_YEAR } from "@/lib/constants";

export function calculateScore(input: JobInput): ScoreResult {
  if (!input.salary || input.salary <= 0) {
    return { ok: false, reason: "missing-salary" };
  }
  if (pppFactors[input.country] === undefined) {
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

  const { hourly: benchmark, source: benchmarkSource } =
    resolveBenchmark(input);

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
