import { describe, it, expect } from "vitest";
import {
  medianAnnualWage,
  GLOBAL_MEDIAN_WAGE_USD,
  MEDIAN_WAGE_SOURCE,
  MEDIAN_WAGE_YEAR,
} from "@/lib/medianWages";
import { pppFactors } from "@/lib/ppp";

describe("medianAnnualWage", () => {
  it("covers the primary English-speaking markets", () => {
    for (const code of ["US", "GB", "CA", "AU", "IE", "NZ"]) {
      expect(medianAnnualWage[code], `missing ${code}`).toBeGreaterThan(0);
    }
  });

  it("only uses country codes that exist in the PPP table", () => {
    for (const code of Object.keys(medianAnnualWage)) {
      expect(pppFactors[code], `${code} absent from PPP table`).toBeDefined();
    }
  });

  it("holds plausible annual PPP-USD figures", () => {
    for (const [code, wage] of Object.entries(medianAnnualWage)) {
      expect(wage, `${code} implausible`).toBeGreaterThan(5_000);
      expect(wage, `${code} implausible`).toBeLessThan(200_000);
    }
  });

  it("documents its provenance", () => {
    expect(MEDIAN_WAGE_SOURCE.length).toBeGreaterThan(10);
    expect(MEDIAN_WAGE_YEAR).toBeGreaterThan(2015);
  });

  it("has a plausible global fallback", () => {
    expect(GLOBAL_MEDIAN_WAGE_USD).toBeGreaterThan(5_000);
    expect(GLOBAL_MEDIAN_WAGE_USD).toBeLessThan(100_000);
  });
});
