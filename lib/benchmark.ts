import type { JobInput, EducationLevel } from "@/lib/types";
import { toPppUsd } from "@/lib/ppp";
import { averageAnnualWage } from "@/lib/medianWages";
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
): { hourly: number; source: "user" | "country-average" } | null {
  if (input.expectedSalary && input.expectedSalary > 0) {
    return {
      hourly: toPppUsd(input.expectedSalary, input.country) / STANDARD_HOURS_PER_YEAR,
      source: "user",
    };
  }

  // No user estimate. Only countries with a sourced OECD figure can be
  // scored — everywhere else there is no honest benchmark to divide by.
  const countryAverage = averageAnnualWage[input.country];
  if (countryAverage === undefined) {
    return null;
  }

  const adjusted =
    countryAverage *
    (EDUCATION_MULTIPLIER[input.education] ?? 1.0) *
    experienceMultiplier(input.yearsExperience);

  return { hourly: adjusted / STANDARD_HOURS_PER_YEAR, source: "country-average" };
}
