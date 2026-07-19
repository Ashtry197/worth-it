"use client";

import { useEffect, useMemo, useState } from "react";
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
    setInput((prev) => ({ ...prev, country: loadCountry() }));
  }, []);

  const onChange = (patch: Partial<JobInput>) => {
    setInput((prev) => {
      const next = { ...prev, ...patch };
      if (patch.country) saveCountry(patch.country);
      return next;
    });
  };

  const result = useMemo(() => calculateScore(input), [input]);

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <CompensationFields value={input} onChange={onChange} />
        <TimeFields value={input} onChange={onChange} />
        <QualityFields value={input} onChange={onChange} />
        <BenchmarkField value={input} onChange={onChange} />
      </form>
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <ScoreDisplay result={result} />
      </aside>
    </div>
  );
}
