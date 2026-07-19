import { describe, it, expect } from "vitest";
import {
  averageAnnualWage,
  GLOBAL_MEDIAN_WAGE_USD,
  GLOBAL_MEDIAN_SOURCE,
  GLOBAL_MEDIAN_WAGE_YEAR,
  WAGE_SOURCE,
  WAGE_YEAR,
} from "@/lib/medianWages";
import { pppFactors } from "@/lib/ppp";

describe("averageAnnualWage", () => {
  it("covers the primary English-speaking markets", () => {
    for (const code of ["US", "GB", "CA", "AU", "IE", "NZ"]) {
      expect(averageAnnualWage[code], `missing ${code}`).toBeGreaterThan(0);
    }
  });

  it("only uses country codes that exist in the PPP table", () => {
    for (const code of Object.keys(averageAnnualWage)) {
      expect(pppFactors[code], `${code} absent from PPP table`).toBeDefined();
    }
  });

  it("holds plausible annual PPP-USD figures", () => {
    for (const [code, wage] of Object.entries(averageAnnualWage)) {
      expect(wage, `${code} implausible`).toBeGreaterThan(5_000);
      expect(wage, `${code} implausible`).toBeLessThan(200_000);
    }
  });

  it("documents its provenance", () => {
    expect(WAGE_SOURCE.length).toBeGreaterThan(10);
    expect(WAGE_YEAR).toBeGreaterThan(2015);
  });

  it("discloses that the country table holds means, not medians", () => {
    expect(WAGE_SOURCE).toMatch(/mean/i);
  });

  it("has a plausible global fallback", () => {
    expect(GLOBAL_MEDIAN_WAGE_USD).toBeGreaterThan(5_000);
    expect(GLOBAL_MEDIAN_WAGE_USD).toBeLessThan(100_000);
  });

  it("dates the global fallback separately from the OECD table", () => {
    // The two sources have different vintages; one year constant would
    // misreport staleness for whichever path it does not describe.
    expect(GLOBAL_MEDIAN_SOURCE.length).toBeGreaterThan(10);
    expect(GLOBAL_MEDIAN_WAGE_YEAR).toBeGreaterThan(2015);
  });
});
