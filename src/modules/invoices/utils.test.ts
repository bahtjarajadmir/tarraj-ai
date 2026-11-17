import { describe, expect, it } from "vitest";
import { formatInvoiceNumber, getDisplayStatus } from "./utils";

const day = 24 * 60 * 60 * 1000;
const past = new Date(Date.now() - 3 * day);
const future = new Date(Date.now() + 3 * day);

describe("formatInvoiceNumber", () => {
  it("pads the number", () => {
    expect(formatInvoiceNumber(1)).toBe("INV-0001");
    expect(formatInvoiceNumber(42)).toBe("INV-0042");
  });
});

describe("getDisplayStatus", () => {
  it("marks a sent invoice past its due date as overdue", () => {
    expect(getDisplayStatus("SENT", past)).toBe("OVERDUE");
  });

  it("keeps a sent invoice not yet due as sent", () => {
    expect(getDisplayStatus("SENT", future)).toBe("SENT");
  });

  it("never marks a paid invoice as overdue", () => {
    expect(getDisplayStatus("PAID", past)).toBe("PAID");
  });

  it("never marks a draft as overdue", () => {
    expect(getDisplayStatus("DRAFT", past)).toBe("DRAFT");
  });
});