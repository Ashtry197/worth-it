"use client";

import { NumberField, SelectField, Section } from "./Field";
import { pppFactors } from "@/lib/ppp";
import { countryNames } from "@/lib/countryNames";
import type { JobInput } from "@/lib/types";

/** Names come from a committed static map, not Intl.DisplayNames at runtime:
 *  that API reads the runtime's own ICU data, so Node rendered "Hong Kong SAR
 *  China" where the browser rendered "Hong Kong" and hydration failed. */
const COUNTRIES = Object.keys(pppFactors)
  .map((code) => ({ value: code, label: countryNames[code] ?? code }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function CompensationFields({
  value, onChange,
}: { value: JobInput; onChange: (patch: Partial<JobInput>) => void }) {
  return (
    <Section
      title="Compensation"
      note="All amounts in your own currency — the country you pick handles the conversion"
    >
      <SelectField
        label="Country"
        hint="Sets the exchange rate used to compare you internationally"
        value={value.country}
        options={COUNTRIES}
        onChange={(country) => onChange({ country })}
      />
      <NumberField
        label="Annual salary"
        hint="Your gross pay for a year, before tax"
        unit="per year"
        value={value.salary}
        onChange={(salary) => onChange({ salary })}
      />
      <NumberField
        label="Employer healthcare contribution"
        hint="An amount of money, not a percentage — what your employer pays toward your cover in a year. Enter 0 if none."
        unit="per year"
        value={value.employerHealthcare}
        onChange={(employerHealthcare) => onChange({ employerHealthcare })}
      />
      <NumberField
        label="Employer pension match"
        hint="An amount of money, not a percentage — what your employer adds to your pension in a year. Enter 0 if none."
        unit="per year"
        value={value.pensionMatch}
        onChange={(pensionMatch) => onChange({ pensionMatch })}
      />
    </Section>
  );
}
