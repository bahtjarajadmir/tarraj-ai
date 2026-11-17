"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentContext } from "@/lib/current-org";
import { ensureDefaults } from "@/modules/transactions/defaults";
import { formatInvoiceNumber } from "@/modules/invoices/utils";

type Result = { error?: string };

function refresh() {
  revalidatePath("/invoices");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function markInvoiceSent(id: string): Promise<Result> {
  const { organization } = await getCurrentContext();

  // Vetëm Draft mund të bëhet Sent
  const result = await db.invoice.updateMany({
    where: { id, organizationId: organization.id, status: "DRAFT" },
    data: { status: "SENT" },
  });
  if (result.count === 0) return { error: "Only draft invoices can be sent" };

  refresh();
  return {};
}

export async function markInvoicePaid(id: string): Promise<Result> {
  const { organization } = await getCurrentContext();
  await ensureDefaults(organization.id);

  const invoice = await db.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: { customer: { select: { name: true } } },
  });
  if (!invoice) return { error: "Invoice not found" };
  if (invoice.status !== "SENT") {
    return { error: "Only sent invoices can be marked as paid" };
  }

  const [category, account] = await Promise.all([
    db.category.findFirst({
      where: { organizationId: organization.id, type: "INCOME" },
      orderBy: { name: "desc" },
    }),
    db.financialAccount.findFirst({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!category || !account) {
    return { error: "No income category or account found" };
  }

  const now = new Date();

  try {
    // Pagesa dhe transaksioni ruhen bashkë: ose të dyja, ose asnjëra
    await db.$transaction(async (tx) => {
      const updated = await tx.invoice.updateMany({
        where: { id, organizationId: organization.id, status: "SENT" },
        data: { status: "PAID", paidAt: now },
      });
      // Nëse dikush e pagoi në të njëjtën kohë, ndalo
      if (updated.count === 0) throw new Error("ALREADY_PAID");

      await tx.transaction.create({
        data: {
          type: "INCOME",
          amountCents: invoice.totalCents,
          date: now,
          description: `Invoice ${formatInvoiceNumber(invoice.number)} - ${invoice.customer.name}`,
          organizationId: organization.id,
          categoryId: category.id,
          accountId: account.id,
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_PAID") {
      return { error: "This invoice was already paid" };
    }
    return { error: "Could not mark the invoice as paid" };
  }

  refresh();
  return {};
}

export async function deleteInvoice(id: string): Promise<Result> {
  const { organization } = await getCurrentContext();

  // Vetëm Draft fshihet; faturat e dërguara ose të paguara mbeten
  const result = await db.invoice.deleteMany({
    where: { id, organizationId: organization.id, status: "DRAFT" },
  });
  if (result.count === 0) return { error: "Only draft invoices can be deleted" };

  refresh();
  return {};
}