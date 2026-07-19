import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/scoring";
import type { JobInput } from "@/lib/types";

/** A deliberately plain baseline: US, 40h week, no commute, neutral quality. */
function baseInput(overrides: Partial<JobInput> = {}): JobInput {
  return {
    salary: 60_000,
    employerHealthcare: 0,
    pensionMatch: 0,
    country: "US",

    workHoursPerDay: 8,
    workDaysPerWeek: 5,
    remoteDaysPerWeek: 0,
    commuteHoursPerDay: 0,
    ptoDays: 0,
    restHoursPerDay: 0,

    environment: 1.0,
    management: 1.0,
    colleagues: 1.0,

    expectedSalary: 60_000,
    employerType: "large-private",
    yearsExperience: 5,
    education: "bachelor",
    ...overrides,
  };
}

describe("calculateScore — core behaviour", () => {
  it("scores 1.0 when pay matches the stated benchmark at standard hours", () => {
    const r = calculateScore(baseInput());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.breakdown.score).toBeCloseTo(1.0, 2);
  });

  it("scores above 1.0 when paid more than the benchmark", () => {
    const r = calculateScore(baseInput({ salary: 90_000 }));
    if (!r.ok) throw new Error("expected ok");
    expect(r.breakdown.score).toBeGreaterThan(1.4);
  });

  it("scores below 1.0 when working longer for the same pay", () => {
    const r = calculateScore(baseInput({ workHoursPerDay: 12 }));
    if (!r.ok) throw new Error("expected ok");
    expect(r.breakdown.score).toBeLessThan(0.8);
  });

  it("adds employer healthcare and pension to total compensation", () => {
    const r = calculateScore(
      baseInput({ employerHealthcare: 6_000, pensionMatch: 3_000 }),
    );
    if (!r.ok) throw new Error("expected ok");
    expect(r.breakdown.totalComp).toBe(69_000);
  });

  it("applies quality factors multiplicatively", () => {
    const neutral = calculateScore(baseInput());
    const good = calculateScore(baseInput({ environment: 1.2 }));
    if (!neutral.ok || !good.ok) throw new Error("expected ok");
    expect(good.breakdown.score).toBeCloseTo(neutral.breakdown.score * 1.2, 4);
  });

  it("converts foreign salaries through PPP", () => {
    const uk = calculateScore(
      baseInput({ country: "GB", salary: 35_000, expectedSalary: 35_000 }),
    );
    if (!uk.ok) throw new Error("expected ok");
    // 35000 / 0.70 = 50000 PPP USD
    expect(uk.breakdown.totalComp).toBe(35_000);
    expect(uk.breakdown.adjustedDailyPay).toBeCloseTo(50_000 / 260, 2);
  });
});

describe("calculateScore — each input counted exactly once", () => {
  it("counts PTO only through the working year, raising the daily rate", () => {
    const none = calculateScore(baseInput());
    const withPto = calculateScore(baseInput({ ptoDays: 25 }));
    if (!none.ok || !withPto.ok) throw new Error("expected ok");

    expect(withPto.breakdown.workDaysPerYear).toBe(260 - 25);
    expect(withPto.breakdown.effectiveHours).toBe(none.breakdown.effectiveHours);
    expect(withPto.breakdown.score).toBeGreaterThan(none.breakdown.score);
  });

  it("counts remote days only through commute exposure", () => {
    const office = calculateScore(baseInput({ commuteHoursPerDay: 1 }));
    const hybrid = calculateScore(
      baseInput({ commuteHoursPerDay: 1, remoteDaysPerWeek: 3 }),
    );
    if (!office.ok || !hybrid.ok) throw new Error("expected ok");

    // Working year is untouched by remote days.
    expect(hybrid.breakdown.workDaysPerYear).toBe(office.breakdown.workDaysPerYear);
    // 2 of 5 days in office.
    expect(hybrid.breakdown.officeDaysRatio).toBeCloseTo(0.4, 6);
    expect(hybrid.breakdown.effectiveHours).toBeCloseTo(8 + 1 * 0.4, 6);
  });

  it("gives remote days no effect when there is no commute", () => {
    const a = calculateScore(baseInput({ commuteHoursPerDay: 0 }));
    const b = calculateScore(
      baseInput({ commuteHoursPerDay: 0, remoteDaysPerWeek: 5 }),
    );
    if (!a.ok || !b.ok) throw new Error("expected ok");
    expect(b.breakdown.score).toBeCloseTo(a.breakdown.score, 6);
  });

  it("does not divide by education level", () => {
    const bachelor = calculateScore(baseInput({ education: "bachelor" }));
    const doctorate = calculateScore(baseInput({ education: "doctorate" }));
    if (!bachelor.ok || !doctorate.ok) throw new Error("expected ok");
    // With an explicit expectedSalary the benchmark is fixed, so education
    // must not move the score at all.
    expect(doctorate.breakdown.score).toBeCloseTo(bachelor.breakdown.score, 6);
  });
});

describe("calculateScore — error handling", () => {
  it("rejects a missing salary rather than returning NaN", () => {
    const r = calculateScore(baseInput({ salary: 0 }));
    expect(r).toEqual({ ok: false, reason: "missing-salary" });
  });

  it("rejects a collapsed denominator", () => {
    // 8 work hours - 0.5 * 20 rest hours = -2
    const r = calculateScore(baseInput({ restHoursPerDay: 20 }));
    expect(r).toEqual({ ok: false, reason: "non-positive-hours" });
  });

  it("rejects zero work days per week", () => {
    const r = calculateScore(baseInput({ workDaysPerWeek: 0 }));
    expect(r).toEqual({ ok: false, reason: "invalid-work-days" });
  });

  it("rejects PTO exceeding the working year", () => {
    const r = calculateScore(baseInput({ ptoDays: 300 }));
    expect(r).toEqual({ ok: false, reason: "invalid-work-days" });
  });

  it("rejects an unknown country", () => {
    const r = calculateScore(baseInput({ country: "ZZ" }));
    expect(r).toEqual({ ok: false, reason: "invalid-country" });
  });

  it("rejects an inherited property masquerading as a country", () => {
    // A bare pppFactors[country] lookup returns Object.prototype.constructor
    // here — truthy, so it would pass a `=== undefined` guard.
    const r = calculateScore(baseInput({ country: "constructor" }));
    expect(r).toEqual({ ok: false, reason: "invalid-country" });
  });

  it("rejects NaN in any numeric field rather than scoring it", () => {
    // NaN <= 0 is false, so NaN slips past ordinary range guards. The form
    // recomputes on every keystroke and Number("1e") is NaN, so this is a
    // reachable state, not a theoretical one.
    for (const field of [
      "salary", "workHoursPerDay", "workDaysPerWeek", "commuteHoursPerDay",
      "restHoursPerDay", "ptoDays", "remoteDaysPerWeek", "environment",
    ] as const) {
      const r = calculateScore(baseInput({ [field]: NaN }));
      expect(r, `${field} = NaN must be rejected`).toEqual({
        ok: false,
        reason: "invalid-number",
      });
    }
  });

  it("rejects Infinity rather than scoring it", () => {
    const r = calculateScore(baseInput({ salary: Infinity }));
    expect(r).toEqual({ ok: false, reason: "invalid-number" });
  });

  it("rejects a NaN expected salary", () => {
    const r = calculateScore(baseInput({ expectedSalary: NaN }));
    expect(r).toEqual({ ok: false, reason: "invalid-number" });
  });

  it("rejects negative money and time inputs", () => {
    for (const field of ["employerHealthcare", "ptoDays", "commuteHoursPerDay"] as const) {
      const r = calculateScore(baseInput({ [field]: -1 }));
      expect(r, `${field} = -1 must be rejected`).toEqual({
        ok: false,
        reason: "invalid-number",
      });
    }
  });

  it("never returns a non-finite score on any accepted input", () => {
    const r = calculateScore(baseInput());
    if (!r.ok) throw new Error("expected ok");
    for (const [key, value] of Object.entries(r.breakdown)) {
      if (typeof value === "number") {
        expect(Number.isFinite(value), `${key} must be finite`).toBe(true);
      }
    }
  });

  it("clamps remote days to the number of work days", () => {
    const r = calculateScore(
      baseInput({ workDaysPerWeek: 5, remoteDaysPerWeek: 9, commuteHoursPerDay: 2 }),
    );
    if (!r.ok) throw new Error("expected ok");
    expect(r.breakdown.officeDaysRatio).toBe(0);
  });
});
