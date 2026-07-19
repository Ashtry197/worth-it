export type EmployerType =
  | "public-sector"
  | "non-profit"
  | "large-private"
  | "startup"
  | "contract"
  | "self-employed";

export type EducationLevel =
  | "highschool"
  | "associate"
  | "bachelor"
  | "master"
  | "doctorate";

/** All monetary values are annual, in the local currency of `country`. */
export interface JobInput {
  salary: number;
  employerHealthcare: number;
  pensionMatch: number;
  country: string;

  workHoursPerDay: number;
  workDaysPerWeek: number;
  remoteDaysPerWeek: number;
  commuteHoursPerDay: number;
  ptoDays: number;
  restHoursPerDay: number;

  environment: number;
  management: number;
  colleagues: number;

  /** Optional user estimate of the typical salary for this role. */
  expectedSalary: number | null;
  employerType: EmployerType;
  yearsExperience: number;
  education: EducationLevel;
}

export interface ScoreBreakdown {
  totalComp: number;
  workDaysPerYear: number;
  officeDaysRatio: number;
  adjustedDailyPay: number;
  effectiveHours: number;
  rawHourly: number;
  qualityMultiplier: number;
  benchmark: number;
  /** Which yardstick the score was measured against:
   *  - "user"            the user's own estimate
   *  - "country-average" OECD mean annual wage, 2025, 12 countries
   *  Countries outside those 12 with no user estimate are not scored at
   *  all — see the "benchmark-unavailable" ScoreError below — so no third
   *  member exists here. */
  benchmarkSource: "user" | "country-average";
  score: number;
}

export type ScoreError =
  | "missing-salary"
  | "non-positive-hours"
  | "invalid-country"
  | "invalid-work-days"
  /** A numeric field was NaN, Infinity, or negative. Reachable in normal use:
   *  the form recomputes on every keystroke, and Number("1e") is NaN. */
  | "invalid-number"
  /** No national wage data exists for the user's country and they gave no
   *  expected-salary estimate, so there is no honest benchmark to divide
   *  by. The calculator declines to score rather than fall back to a
   *  global figure that would be off by 2-5x. */
  | "benchmark-unavailable";

export type ScoreResult =
  | { ok: true; breakdown: ScoreBreakdown }
  | { ok: false; reason: ScoreError };
