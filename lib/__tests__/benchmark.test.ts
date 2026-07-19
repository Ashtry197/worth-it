import { describe, it, expect } from "vitest";
import { resolveBenchmark } from "@/lib/benchmark";
import { averageAnnualWage } from "@/lib/medianWages";
import type { JobInput } from "@/lib/types";

function input(overrides: Partial<JobInput> = {}): JobInput {
  return {
    salary: 60_000, employerHealthcare: 0, pensionMatch: 0, country: "US",
    workHoursPerDay: 8, workDaysPerWeek: 5, remoteDaysPerWeek: 0,
    commuteHoursPerDay: 0, ptoDays: 0, restHoursPerDay: 0,
    environment: 1, management: 1, colleagues: 1,
    expectedSalary: null, employerType: "large-private",
    yearsExperience: 5, education: "bachelor",
    ...overrides,
  };
}

describe("resolveBenchmark", () => {
  it("prefers the user's own estimate", () => {
    const r = resolveBenchmark(input({ expectedSalary: 80_000 }));
    expect(r.source).toBe("user");
    expect(r.hourly).toBeCloseTo(80_000 / 2080, 6);
  });

  it("converts the user estimate through PPP", () => {
    const r = resolveBenchmark(
      input({ country: "GB", expectedSalary: 35_000 }),
    );
    expect(r.hourly).toBeCloseTo(50_000 / 2080, 4);
  });

  it("ignores experience and education when the user supplies an estimate", () => {
    const junior = resolveBenchmark(
      input({ expectedSalary: 80_000, yearsExperience: 0, education: "highschool" }),
    );
    const senior = resolveBenchmark(
      input({ expectedSalary: 80_000, yearsExperience: 20, education: "doctorate" }),
    );
    expect(junior.hourly).toBe(senior.hourly);
  });

  it("falls back to the country average when no estimate is given", () => {
    const r = resolveBenchmark(input({ country: "US", expectedSalary: null }));
    expect(r.source).toBe("country-average");
    expect(r.hourly).toBeCloseTo(
      (averageAnnualWage.US * 1.0 * 1.0) / 2080, 4,
    );
  });

  it("raises the fallback benchmark with experience", () => {
    const junior = resolveBenchmark(input({ expectedSalary: null, yearsExperience: 0 }));
    const senior = resolveBenchmark(input({ expectedSalary: null, yearsExperience: 15 }));
    expect(senior.hourly).toBeGreaterThan(junior.hourly);
  });

  it("raises the fallback benchmark with education", () => {
    const hs = resolveBenchmark(input({ expectedSalary: null, education: "highschool" }));
    const phd = resolveBenchmark(input({ expectedSalary: null, education: "doctorate" }));
    expect(phd.hourly).toBeGreaterThan(hs.hourly);
  });

  it("uses the global median for a country with no local figure", () => {
    // AF is in the PPP table but not in the wage table.
    const r = resolveBenchmark(input({ country: "AF", expectedSalary: null }));
    expect(r.source).toBe("global-median");
    expect(r.hourly).toBeGreaterThan(0);
  });

  it("distinguishes the two fallback statistics", () => {
    // The country path is an OECD mean; the global path is an ILO median.
    // Reporting both as "fallback" would hide a ~15-20% difference in yardstick.
    const covered = resolveBenchmark(input({ country: "US", expectedSalary: null }));
    const uncovered = resolveBenchmark(input({ country: "AF", expectedSalary: null }));
    expect(covered.source).not.toBe(uncovered.source);
  });

  it("never returns a zero or negative benchmark", () => {
    for (const country of ["US", "GB", "JP", "AF"]) {
      expect(resolveBenchmark(input({ country, expectedSalary: null })).hourly)
        .toBeGreaterThan(0);
    }
  });
});
