"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentContext } from "@/lib/current-org";

const itemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Each line needs a description")
    .max(200, "A description is too long"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(100000, "Quantity is too large"),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price, like 25.50"),
});

const schema = z.object({
  customerId: z.string().min(1, "Pick a customer"),
  issueDate: z.string().min(1, "Pick an issue date"),
  dueDate: z.string().min(1, "Pick a due date"),
  notes: z.string().max(500, "Notes are too long").optional(),
  items: z.array(itemSchema).min(1, "Add at least one line"),
});

export async function createInvoice(
  input: unknown
): Promise<{ error?: string }> {
  const { organization } = await getCurrentContext();

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  if (d.dueDate < d.issueDate) {
    return { error: "Due date cannot be before the issue date" };
  }

  // Paratë në centë; totali llogaritet në server, jo nga faqja
  const items = d.items.map((i) => ({
    description: i.description,
    quantity: i.quantity,
    unitPriceCents: Math.round(parseFloat(i.price) * 100),
  }));
  const totalCents = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPriceCents,
    0
  );
  if (totalCents <= 0) return { error: "Total must be greater than zero" };
  if (totalCents > 1_000_000_000) return { error: "Total is too large" };

  // Siguri: klienti duhet t'i përkasë kompanisë sonë
  const customer = await db.customer.findFirst({
    where: { id: d.customerId, organizationId: organization.id },
  });
  if (!customer) return { error: "Invalid customer" };

  await db.$transaction(async (tx) => {
    // The generated transaction-client type omits the invoice delegate.
    const invoice = (tx as unknown as { invoice: typeof db extends { invoice: infer T } ? T : any }).invoice;
    const last = await invoice.findFirst({
      where: { organizationId: organization.id },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    await invoice.create({
      data: {
        number: (last?.number ?? 0) + 1,
        issueDate: new Date(d.issueDate),
        dueDate: new Date(d.dueDate),
        notes: d.notes,
        totalCents,
        organizationId: organization.id,
        customerId: customer.id,
        items: { create: items },
      },
    });
  });

  revalidatePath("/invoices");
  return {};
}