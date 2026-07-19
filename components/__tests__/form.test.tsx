import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompensationFields } from "@/components/form/CompensationFields";
import { TimeFields } from "@/components/form/TimeFields";
import type { JobInput } from "@/lib/types";
import { useState } from "react";
import { QualityFields } from "@/components/form/QualityFields";
import { BenchmarkField } from "@/components/form/BenchmarkField";
import { WAGE_YEAR } from "@/lib/medianWages";

const value: JobInput = {
  salary: 60_000, employerHealthcare: 0, pensionMatch: 0, country: "US",
  workHoursPerDay: 8, workDaysPerWeek: 5, remoteDaysPerWeek: 0,
  commuteHoursPerDay: 0, ptoDays: 0, restHoursPerDay: 0,
  environment: 1, management: 1, colleagues: 1,
  expectedSalary: null, employerType: "large-private",
  yearsExperience: 5, education: "bachelor",
};

describe("CompensationFields", () => {
  it("emits a salary patch on edit", () => {
    const onChange = vi.fn();
    render(<CompensationFields value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/annual salary/i), {
      target: { value: "75000" },
    });
    expect(onChange).toHaveBeenCalledWith({ salary: 75_000 });
  });

  it("lists countries from the PPP table", () => {
    render(<CompensationFields value={value} onChange={vi.fn()} />);
    const select = screen.getByLabelText(/country/i) as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(170);
  });

  it("labels countries by name, not bare ISO code", () => {
    render(<CompensationFields value={value} onChange={vi.fn()} />);
    const select = screen.getByLabelText(/country/i) as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent);
    expect(labels).toContain("United Kingdom");
  });
});

describe("TimeFields", () => {
  it("emits a remote-days patch on edit", () => {
    const onChange = vi.fn();
    render(<TimeFields value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/remote days/i), {
      target: { value: "3" },
    });
    expect(onChange).toHaveBeenCalledWith({ remoteDaysPerWeek: 3 });
  });
});

/** A vi.fn() onChange never feeds the emitted value back in, so it cannot
 *  catch a field that corrupts state on re-render. These drive a real
 *  controlled parent, which is how the decimal-entry bug was found. */
function ControlledHarness() {
  const [input, setInput] = useState<JobInput>(value);
  return (
    <>
      <TimeFields
        value={input}
        onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
      />
      <output data-testid="hours">{String(input.workHoursPerDay)}</output>
    </>
  );
}

describe("NumberField under a real controlled parent", () => {
  it("accepts a decimal typed one character at a time", () => {
    render(<ControlledHarness />);
    const field = screen.getByLabelText(/work hours per day/i);

    // Typing "7.5": the intermediate "7." must survive rather than being
    // read as a cleared field and overwritten with 0.
    fireEvent.change(field, { target: { value: "7" } });
    fireEvent.change(field, { target: { value: "7." } });
    expect((field as HTMLInputElement).value).toBe("7.");

    fireEvent.change(field, { target: { value: "7.5" } });
    expect((field as HTMLInputElement).value).toBe("7.5");
    expect(screen.getByTestId("hours").textContent).toBe("7.5");
  });

  it("leaves unparseable input visible and reports it as NaN", () => {
    render(<ControlledHarness />);
    const field = screen.getByLabelText(/work hours per day/i);
    fireEvent.change(field, { target: { value: "7e" } });

    // The draft is preserved so the user can finish typing "7e2",
    // while scoring sees NaN and returns a typed invalid-number error.
    expect((field as HTMLInputElement).value).toBe("7e");
    expect(screen.getByTestId("hours").textContent).toBe("NaN");
  });

  it("treats a cleared field as zero", () => {
    render(<ControlledHarness />);
    const field = screen.getByLabelText(/work hours per day/i);
    fireEvent.change(field, { target: { value: "" } });
    expect(screen.getByTestId("hours").textContent).toBe("0");
  });
});

describe("QualityFields", () => {
  it("emits numbers, not the select's string values", () => {
    const onChange = vi.fn();
    render(<QualityFields value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/working environment/i), {
      target: { value: "0.8" },
    });
    expect(onChange).toHaveBeenCalledWith({ environment: 0.8 });
  });

  it("offers only the documented 0.8-1.2 range", () => {
    render(<QualityFields value={value} onChange={vi.fn()} />);
    const select = screen.getByLabelText(/management/i) as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => Number(o.value));
    expect(values).toEqual([0.8, 0.9, 1, 1.1, 1.2]);
  });
});

describe("BenchmarkField", () => {
  it("describes the OECD mean and warns uncovered countries need an estimate", () => {
    // Only one statistic remains (the OECD mean) now that the ILO global
    // median fallback has been deleted; copy claiming a global fallback
    // still exists would be a false promise.
    render(<BenchmarkField value={{ ...value, expectedSalary: null }} onChange={vi.fn()} />);
    const note = screen.getByText(/published wage data/i);
    expect(note.textContent).toMatch(/mean/i);
    expect(note.textContent).toContain(String(WAGE_YEAR));
    expect(note.textContent).toMatch(/enter a typical salary/i);
  });

  it("hides the fallback disclosure once an estimate is given", () => {
    render(<BenchmarkField value={{ ...value, expectedSalary: 80_000 }} onChange={vi.fn()} />);
    expect(screen.queryByText(/published wage data/i)).toBeNull();
  });
});
