// Regenerates lib/countryNames.ts from the country codes in lib/ppp.ts.
//
// Run this only when the PPP table gains or loses a country. The output is
// committed deliberately: resolving names at runtime with Intl.DisplayNames
// reads the runtime's own ICU data, which differs between Node and browsers
// ("Hong Kong SAR China" vs "Hong Kong"), so a prerendered page could never
// match the client and React threw a hydration mismatch.
//
// Usage: node scripts/gen-country-names.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = join(fileURLToPath(new URL("../", import.meta.url)));

const src = readFileSync(join(ROOT, "lib/ppp.ts"), "utf8");
const codes = [...src.matchAll(/^\s*'([A-Z]{2})':/gm)].map((m) => m[1]);
const display = new Intl.DisplayNames(["en"], { type: "region" });

/** CLDR writes a few of these in forms no one says out loud. */
const OVERRIDES = {
  HK: "Hong Kong",
  MO: "Macao",
  MM: "Myanmar",
  PS: "Palestine",
  CD: "DR Congo",
  CG: "Congo-Brazzaville",
};

const entries = codes
  .map((code) => [code, OVERRIDES[code] ?? display.of(code) ?? code])
  .sort((a, b) => a[0].localeCompare(b[0]));

const unresolved = entries.filter(([code, name]) => name === code);
if (unresolved.length) {
  console.error(
    `Unresolved country codes: ${unresolved.map(([c]) => c).join(", ")}`,
  );
  process.exit(1);
}

const body = entries
  .map(([code, name]) => `  ${code}: ${JSON.stringify(name)},`)
  .join("\n");

writeFileSync(
  join(ROOT, "lib/countryNames.ts"),
  `/**
 * Display names for every country in the PPP table.
 *
 * Generated once and committed rather than resolved at runtime with
 * Intl.DisplayNames. That API reads the *runtime's* ICU data, and Node's
 * differs from the browser's — Node says "Hong Kong SAR China" where Chrome
 * says "Hong Kong" — so a prerendered page could never match the client and
 * React threw a hydration mismatch. Static data is identical everywhere.
 *
 * Regenerate with: node scripts/gen-country-names.mjs
 */
export const countryNames: Record<string, string> = {
${body}
};
`,
);

console.log(`Wrote lib/countryNames.ts (${entries.length} countries)`);
