"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentContext } from "@/lib/current-org";

const schema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount, like 25.50"),
  date: z.string().min(1, "Pick a date"),
  categoryId: z.string().min(1, "Pick a category"),
  accountId: z.string().min(1, "Pick an account"),
  description: z.string().max(200, "Description is too long").optional(),
});

export type FormState = { error?: string; success?: boolean };

export async function createTransaction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { organization } = await getCurrentContext();

  const parsed = schema.safeParse({
    type: formData.get("type"),
    amount: String(formData.get("amount") ?? "").trim().replace(",", "."),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    accountId: formData.get("accountId"),
    description: String(formData.get("description") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const d = parsed.data;
  const cents = Math.round(parseFloat(d.amount) * 100);
  if (cents <= 0) return { error: "Amount must be greater than zero" };

  // Siguri: kategoria dhe llogaria duhet t'i përkasin kompanisë sonë
  const [category, account] = await Promise.all([
    db.category.findFirst({
      where: { id: d.categoryId, organizationId: organization.id, type: d.type },
    }),
    db.financialAccount.findFirst({
      where: { id: d.accountId, organizationId: organization.id },
    }),
  ]);
  if (!category || !account) return { error: "Invalid category or account" };

  await db.transaction.create({
    data: {
      type: d.type,
      amountCents: cents,
      date: new Date(d.date),
      description: d.description,
      organizationId: organization.id,
      categoryId: category.id,
      accountId: account.id,
    },
  });

  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const { organization } = await getCurrentContext();

  await db.transaction.deleteMany({
    where: { id, organizationId: organization.id },
  });

  revalidatePath("/transactions");
}