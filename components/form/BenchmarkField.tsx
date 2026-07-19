"use client";

import { NumberField, SelectField, Section } from "./Field";
import {
  averageAnnualWage,
  WAGE_SOURCE,
  WAGE_YEAR,
  GLOBAL_MEDIAN_SOURCE,
  GLOBAL_MEDIAN_WAGE_YEAR,
} from "@/lib/medianWages";
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
        hint="Optional, but makes your score far more meaningful"
        value={value.expectedSalary ?? 0}
        step={1000}
        onChange={(n) => onChange({ expectedSalary: n > 0 ? n : null })}
      />
      <SelectField
        label="Employer type"
        value={value.employerType}
        options={EMPLOYER_TYPES}
        onChange={(employerType) => onChange({ employerType })}
      />
      <SelectField
        label="Education"
        value={value.education}
        options={EDUCATION}
        onChange={(education) => onChange({ education })}
      />
      <NumberField
        label="Years of experience"
        value={value.yearsExperience}
        onChange={(yearsExperience) => onChange({ yearsExperience })}
      />
      {usingFallback && (
        <p className="text-xs text-gray-500 sm:col-span-2">
          No estimate given, so your score is measured against published wage
          data for your country, adjusted for education and experience. For{" "}
          {Object.keys(averageAnnualWage).length} countries that is{" "}
          {WAGE_SOURCE} ({WAGE_YEAR}); elsewhere it is {GLOBAL_MEDIAN_SOURCE} (
          {GLOBAL_MEDIAN_WAGE_YEAR}). Both are all-role figures across a whole
          country, so treat the result as a rough guide.
        </p>
      )}
    </Section>
  );
}
