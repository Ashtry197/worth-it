import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calculator } from "@/components/Calculator";

describe("Calculator", () => {
  it("prompts for a salary before scoring", () => {
    render(<Calculator />);
    expect(screen.getByText(/enter your salary/i)).toBeDefined();
  });

  it("shows a score once a salary is entered", () => {
    render(<Calculator />);
    fireEvent.change(screen.getByLabelText(/annual salary/i), {
      target: { value: "60000" },
    });
    expect(screen.getByTestId("score-value").textContent).toMatch(/\d/);
  });

  it("explains a collapsed denominator instead of showing NaN", () => {
    render(<Calculator />);
    fireEvent.change(screen.getByLabelText(/annual salary/i), {
      target: { value: "60000" },
    });
    fireEvent.change(screen.getByLabelText(/downtime hours/i), {
      target: { value: "20" },
    });
    expect(screen.getByText(/downtime.*exceeds/i)).toBeDefined();
    expect(screen.queryByText(/NaN/)).toBeNull();
  });
});
