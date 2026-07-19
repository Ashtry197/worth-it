"use client";

import { SelectField, Section } from "./Field";
import type { JobInput } from "@/lib/types";

const SCALE = [
  { value: "0.8", label: "Poor" },
  { value: "0.9", label: "Below average" },
  { value: "1", label: "Average" },
  { value: "1.1", label: "Good" },
  { value: "1.2", label: "Excellent" },
] as const;

export function QualityFields({
  value, onChange,
}: { value: JobInput; onChange: (patch: Partial<JobInput>) => void }) {
  return (
    <Section
      title="Conditions"
      note="Your own judgement — each one moves the score by up to 20% either way"
    >
      <SelectField
        label="Working environment"
        hint="The place itself: space, noise, light, equipment"
        value={String(value.environment)}
        options={SCALE}
        onChange={(v) => onChange({ environment: Number(v) })}
      />
      <SelectField
        label="Management"
        hint="Your manager and how you're treated day to day"
        value={String(value.management)}
        options={SCALE}
        onChange={(v) => onChange({ management: Number(v) })}
      />
      <SelectField
        label="Colleagues"
        hint="The people you work alongside"
        value={String(value.colleagues)}
        options={SCALE}
        onChange={(v) => onChange({ colleagues: Number(v) })}
      />
    </Section>
  );
}
