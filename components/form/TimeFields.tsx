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
        hint="On a normal working day. Decimals are fine — 7.5 for a seven-and-a-half hour day."
        unit="hours"
        value={value.workHoursPerDay}
        onChange={(workHoursPerDay) => onChange({ workHoursPerDay })}
      />
      <NumberField
        label="Work days per week"
        hint="Usually 5. Use 2.5 for a half-week."
        unit="days"
        value={value.workDaysPerWeek}
        onChange={(workDaysPerWeek) => onChange({ workDaysPerWeek })}
      />
      <NumberField
        label="Remote days per week"
        hint="How many of those days you work from home. Only affects your commute."
        unit="days"
        value={value.remoteDaysPerWeek}
        onChange={(remoteDaysPerWeek) => onChange({ remoteDaysPerWeek })}
      />
      <NumberField
        label="Commute hours per day"
        hint="Both directions added together, on a day you go in. 0 if you never commute."
        unit="hours"
        value={value.commuteHoursPerDay}
        onChange={(commuteHoursPerDay) => onChange({ commuteHoursPerDay })}
      />
      <NumberField
        label="Paid leave days per year"
        hint="Holiday you're paid for. Fewer working days for the same salary raises your daily rate."
        unit="days"
        value={value.ptoDays}
        onChange={(ptoDays) => onChange({ ptoDays })}
      />
      <NumberField
        label="Downtime hours per day"
        hint="Hours you're at work but not working — long lunches, dead time. 0 if none."
        unit="hours"
        value={value.restHoursPerDay}
        onChange={(restHoursPerDay) => onChange({ restHoursPerDay })}
      />
    </Section>
  );
}
