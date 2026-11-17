"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentContext } from "@/lib/current-org";

const schema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount, like 500"),
});

export type BudgetFormState = { error?: string; success?: boolean };

export async function saveBudget(
  _prev: BudgetFormState,
  formData: FormData
): Promise<BudgetFormState> {
  const { organization } = await getCurrentContext();

  const parsed = schema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: String(formData.get("amount") ?? "").trim().replace(",", "."),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cents = Math.round(parseFloat(parsed.data.amount) * 100);
  if (cents <= 0) return { error: "Limit must be greater than zero" };
  if (cents > 1_000_000_000) return { error: "Limit is too large" };

  // Siguri: kategoria duhet t'i përkasë kompanisë dhe të jetë shpenzim
  const category = await db.category.findFirst({
    where: {
      id: parsed.data.categoryId,
      organizationId: organization.id,
      type: "EXPENSE",
    },
  });
  if (!category) return { error: "Invalid category" };

  // Një buxhet për kategori: nëse ekziston, ndryshon limitin
  await db.budget.upsert({
    where: {
      organizationId_categoryId: {
        organizationId: organization.id,
        categoryId: category.id,
      },
    },
    update: { amountCents: cents },
    create: {
      amountCents: cents,
      organizationId: organization.id,
      categoryId: category.id,
    },
  });

  revalidatePath("/budgets");
  return { success: true };
}

export async function deleteBudget(id: string) {
  const { organization } = await getCurrentContext();

  await db.budget.deleteMany({
    where: { id, organizationId: organization.id },
  });

  revalidatePath("/budgets");
}