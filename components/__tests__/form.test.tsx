import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompensationFields } from "@/components/form/CompensationFields";
import { TimeFields } from "@/components/form/TimeFields";
import type { JobInput } from "@/lib/types";

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
