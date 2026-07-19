import { describe, it, expect } from "vitest";
import { pppFactors, toPppUsd } from "@/lib/ppp";

describe("pppFactors", () => {
  it("anchors the United States at 1.00", () => {
    expect(pppFactors.US).toBe(1.0);
  });

  it("covers at least 170 countries", () => {
    expect(Object.keys(pppFactors).length).toBeGreaterThanOrEqual(170);
  });

  it("has only positive factors", () => {
    for (const [code, factor] of Object.entries(pppFactors)) {
      expect(factor, `${code} must be positive`).toBeGreaterThan(0);
    }
  });

  it("uses ISO-3166 alpha-2 keys", () => {
    for (const code of Object.keys(pppFactors)) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe("toPppUsd", () => {
  it("passes USD through unchanged", () => {
    expect(toPppUsd(50_000, "US")).toBe(50_000);
  });

  it("divides by the local factor", () => {
    // GB factor is 0.70 local units per USD
    expect(toPppUsd(35_000, "GB")).toBeCloseTo(50_000, 0);
  });

  it("converts high-denomination currencies", () => {
    // JP factor is 102.84
    expect(toPppUsd(5_000_000, "JP")).toBeCloseTo(48_619, 0);
  });

  it("throws on an unknown country", () => {
    expect(() => toPppUsd(1000, "ZZ")).toThrow(/unknown country/i);
  });
});
