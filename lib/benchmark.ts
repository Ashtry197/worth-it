import type { JobInput, EducationLevel } from "@/lib/types";
import { toPppUsd } from "@/lib/ppp";
import { averageAnnualWage, GLOBAL_MEDIAN_WAGE_USD } from "@/lib/medianWages";
import { STANDARD_HOURS_PER_YEAR } from "@/lib/constants";

/** Multipliers on the country median. Applied only to the fallback path —
 *  a user-supplied estimate already reflects their own circumstances. */
const EDUCATION_MULTIPLIER: Record<EducationLevel, number> = {
  highschool: 0.85,
  associate: 0.95,
  bachelor: 1.0,
  master: 1.15,
  doctorate: 1.3,
};

function experienceMultiplier(years: number): number {
  if (years <= 0) return 0.75;
  if (years <= 2) return 0.9;
  if (years <= 5) return 1.0;
  if (years <= 10) return 1.2;
  return 1.35;
}

export function resolveBenchmark(
  input: JobInput,
): { hourly: number; source: "user" | "country-average" | "global-median" } {
  if (input.expectedSalary && input.expectedSalary > 0) {
    return {
      hourly: toPppUsd(input.expectedSalary, input.country) / STANDARD_HOURS_PER_YEAR,
      source: "user",
    };
  }

  // The two fallbacks are different statistics from different years, so which
  // one we used is reported back rather than flattened into "fallback".
  const countryAverage = averageAnnualWage[input.country];
  const base = countryAverage ?? GLOBAL_MEDIAN_WAGE_USD;
  const source = countryAverage === undefined ? "global-median" : "country-average";

  const adjusted =
    base *
    EDUCATION_MULTIPLIER[input.education] *
    experienceMultiplier(input.yearsExperience);

  return { hourly: adjusted / STANDARD_HOURS_PER_YEAR, source };
}
