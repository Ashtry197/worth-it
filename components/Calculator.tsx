"use client";

import { useEffect, useState } from "react";
import { CompensationFields } from "./form/CompensationFields";
import { TimeFields } from "./form/TimeFields";
import { QualityFields } from "./form/QualityFields";
import { BenchmarkField } from "./form/BenchmarkField";
import { ScoreDisplay } from "./ScoreDisplay";
import { calculateScore } from "@/lib/scoring";
import { loadCountry, saveCountry } from "@/lib/storage";
import type { JobInput } from "@/lib/types";

const INITIAL: JobInput = {
  salary: 0, employerHealthcare: 0, pensionMatch: 0, country: "US",
  workHoursPerDay: 8, workDaysPerWeek: 5, remoteDaysPerWeek: 0,
  commuteHoursPerDay: 0, ptoDays: 0, restHoursPerDay: 0,
  environment: 1, management: 1, colleagues: 1,
  expectedSalary: null, employerType: "large-private",
  yearsExperience: 5, education: "bachelor",
};

export function Calculator() {
  const [input, setInput] = useState<JobInput>(INITIAL);

  useEffect(() => {
    // localStorage is unavailable during the static export's build-time render,
    // so this must run after mount. A lazy useState initialiser would bake "US"
    // into the prerendered HTML and hydrate to a different value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInput((prev) => ({ ...prev, country: loadCountry() }));
  }, []);

  const onChange = (patch: Partial<JobInput>) => {
    if (patch.country) saveCountry(patch.country);
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const result = calculateScore(input);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_23rem] lg:gap-14">
      <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
        <CompensationFields value={input} onChange={onChange} />
        <TimeFields value={input} onChange={onChange} />
        <QualityFields value={input} onChange={onChange} />
        <BenchmarkField value={input} onChange={onChange} />
      </form>
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <ScoreDisplay result={result} />
      </aside>
    </div>
  );
}
