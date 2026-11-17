import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats cents as currency", () => {
    expect(formatMoney(2550, "EUR")).toBe("€25.50");
  });

  it("formats zero", () => {
    expect(formatMoney(0, "EUR")).toBe("€0.00");
  });

  it("formats thousands with separators", () => {
    expect(formatMoney(100000, "EUR")).toBe("€1,000.00");
  });
});