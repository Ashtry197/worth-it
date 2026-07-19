"use client";

import { NumberField, Section } from "./Field";
import type { JobInput } from "@/lib/types";

export function TimeFields({
  value, onChange,
}: { value: JobInput; onChange: (patch: Partial<JobInput>) => void }) {
  return (
    <Section title="Time">
      <NumberField
        label="Work hours per day"
        value={value.workHoursPerDay}
        step={0.5}
        onChange={(workHoursPerDay) => onChange({ workHoursPerDay })}
      />
      <NumberField
        label="Work days per week"
        value={value.workDaysPerWeek}
        step={0.5}
        onChange={(workDaysPerWeek) => onChange({ workDaysPerWeek })}
      />
      <NumberField
        label="Remote days per week"
        hint="Reduces commute exposure only"
        value={value.remoteDaysPerWeek}
        step={0.5}
        onChange={(remoteDaysPerWeek) => onChange({ remoteDaysPerWeek })}
      />
      <NumberField
        label="Commute hours per day"
        hint="Round trip, on days in the office"
        value={value.commuteHoursPerDay}
        step={0.25}
        onChange={(commuteHoursPerDay) => onChange({ commuteHoursPerDay })}
      />
      <NumberField
        label="Paid leave days per year"
        hint="Raises your effective daily rate"
        value={value.ptoDays}
        onChange={(ptoDays) => onChange({ ptoDays })}
      />
      <NumberField
        label="Downtime hours per day"
        hint="Time on the clock but not working"
        value={value.restHoursPerDay}
        step={0.25}
        onChange={(restHoursPerDay) => onChange({ restHoursPerDay })}
      />
    </Section>
  );
}
