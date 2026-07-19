"use client";

import { NumberField, SelectField, Section } from "./Field";
import { averageAnnualWage, WAGE_SOURCE, WAGE_YEAR } from "@/lib/medianWages";
import type { JobInput, EmployerType, EducationLevel } from "@/lib/types";

const EMPLOYER_TYPES: ReadonlyArray<{ value: EmployerType; label: string }> = [
  { value: "public-sector", label: "Public sector" },
  { value: "non-profit", label: "Non-profit" },
  { value: "large-private", label: "Large private company" },
  { value: "startup", label: "Startup" },
  { value: "contract", label: "Contract or agency" },
  { value: "self-employed", label: "Self-employed" },
];

const EDUCATION: ReadonlyArray<{ value: EducationLevel; label: string }> = [
  { value: "highschool", label: "High school" },
  { value: "associate", label: "Associate degree" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "master", label: "Master's degree" },
  { value: "doctorate", label: "Doctorate" },
];

export function BenchmarkField({
  value, onChange,
}: { value: JobInput; onChange: (patch: Partial<JobInput>) => void }) {
  const usingFallback = !value.expectedSalary || value.expectedSalary <= 0;

  return (
    <Section title="Benchmark">
      <NumberField
        label="Typical salary for your role"
        hint="What you think someone doing your job usually earns. Optional, but it makes the score far more meaningful — and it's the only way to get one if your country isn't covered below."
        unit="per year"
        value={value.expectedSalary ?? 0}
        onChange={(n) => onChange({ expectedSalary: n > 0 ? n : null })}
      />
      <SelectField
        label="Employer type"
        hint="Recorded with your result; doesn't affect the score yet"
        value={value.employerType}
        options={EMPLOYER_TYPES}
        onChange={(employerType) => onChange({ employerType })}
      />
      <SelectField
        label="Education"
        hint="Your highest completed level. Only used when the salary above is blank."
        value={value.education}
        options={EDUCATION}
        onChange={(education) => onChange({ education })}
      />
      <NumberField
        label="Years of experience"
        hint="Total working years in this field. Only used when the salary above is blank."
        unit="years"
        value={value.yearsExperience}
        onChange={(yearsExperience) => onChange({ yearsExperience })}
      />
      {usingFallback && (
        <p className="text-xs text-graphite sm:col-span-2">
          No estimate given, so your score is measured against published wage
          data for your country, adjusted for education and experience. This
          is only available for {Object.keys(averageAnnualWage).length}{" "}
          countries — {WAGE_SOURCE} ({WAGE_YEAR}), an all-role mean rather
          than a median, so treat the result as a rough guide. For countries
          outside that table, enter a typical salary above to get a score —
          we don&apos;t have national wage data to fall back on.
        </p>
      )}
    </Section>
  );
}
