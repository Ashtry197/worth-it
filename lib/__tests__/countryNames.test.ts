import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { countryNames } from "@/lib/countryNames";
import { pppFactors } from "@/lib/ppp";

describe("countryNames", () => {
  it("names every country in the PPP table", () => {
    for (const code of Object.keys(pppFactors)) {
      expect(countryNames[code], `no name for ${code}`).toBeTruthy();
    }
  });

  it("never falls back to a bare ISO code", () => {
    for (const [code, name] of Object.entries(countryNames)) {
      expect(name, `${code} is unresolved`).not.toBe(code);
    }
  });

  it("uses the names people actually say", () => {
    expect(countryNames.GB).toBe("United Kingdom");
    expect(countryNames.US).toBe("United States");
    // CLDR's long forms for these read as officialese; we override them.
    expect(countryNames.HK).toBe("Hong Kong");
    expect(countryNames.MM).toBe("Myanmar");
  });

  it("resolves names statically, never through the runtime's ICU data", () => {
    // Intl.DisplayNames returns different strings in Node and in browsers
    // ("Hong Kong SAR China" vs "Hong Kong"), so calling it while rendering
    // guarantees a hydration mismatch. This caught a real bug — keep it.
    //
    // Matches the call form specifically. An earlier version matched any
    // mention and failed on the comment in that file explaining why the
    // API is avoided — a guard that fires on its own documentation is
    // worse than no guard, because the fix is to delete the explanation.
    const component = readFileSync(
      path.resolve(__dirname, "../../components/form/CompensationFields.tsx"),
      "utf8",
    );
    expect(component).not.toMatch(/Intl\s*\.\s*DisplayNames\s*\(/);
  });
});
