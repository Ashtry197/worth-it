"use client";

import { NumberField, SelectField, Section } from "./Field";
import { pppFactors } from "@/lib/ppp";
import type { JobInput } from "@/lib/types";

const COUNTRIES = Object.keys(pppFactors)
  .sort()
  .map((code) => ({ value: code, label: code }));

export function CompensationFields({
  value, onChange,
}: { value: JobInput; onChange: (patch: Partial<JobInput>) => void }) {
  return (
    <Section title="Compensation">
      <SelectField
        label="Country"
        value={value.country}
        options={COUNTRIES}
        onChange={(country) => onChange({ country })}
      />
      <NumberField
        label="Annual salary"
        hint="Before tax, in your local currency"
        value={value.salary}
        step={1000}
        onChange={(salary) => onChange({ salary })}
      />
      <NumberField
        label="Employer healthcare contribution"
        hint="Annual value. Enter 0 if none."
        value={value.employerHealthcare}
        step={500}
        onChange={(employerHealthcare) => onChange({ employerHealthcare })}
      />
      <NumberField
        label="Employer pension match"
        hint="Annual value. Enter 0 if none."
        value={value.pensionMatch}
        step={500}
        onChange={(pensionMatch) => onChange({ pensionMatch })}
      />
    </Section>
  );
}
