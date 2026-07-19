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
  benchmarkSource: "user" | "fallback";
  score: number;
}

export type ScoreError =
  | "missing-salary"
  | "non-positive-hours"
  | "invalid-country"
  | "invalid-work-days";

export type ScoreResult =
  | { ok: true; breakdown: ScoreBreakdown }
  | { ok: false; reason: ScoreError };
