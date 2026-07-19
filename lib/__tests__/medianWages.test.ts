import { describe, it, expect } from "vitest";
import { averageAnnualWage, WAGE_SOURCE, WAGE_YEAR } from "@/lib/medianWages";
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
});
