export function formatInvoiceNumber(n: number) {
  return `INV-${String(n).padStart(4, "0")}`;
}

export type DisplayStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";

// "Overdue" nuk ruhet në databazë: llogaritet nga afati
export function getDisplayStatus(
  status: "DRAFT" | "SENT" | "PAID",
  dueDate: Date
): DisplayStatus {
  const today = new Date().toISOString().slice(0, 10);
  const due = dueDate.toISOString().slice(0, 10);
  if (status === "SENT" && due < today) return "OVERDUE";
  return status;
}