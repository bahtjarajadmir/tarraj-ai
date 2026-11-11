import { db } from "@/lib/db";

const expenseCategories = [
  "Rent",
  "Salaries",
  "Marketing",
  "Software",
  "Utilities",
  "Taxes",
  "Other expenses",
];
const incomeCategories = ["Sales", "Services", "Other income"];

export async function ensureDefaults(organizationId: string) {
  const [accounts, categories] = await Promise.all([
    db.financialAccount.count({ where: { organizationId } }),
    db.category.count({ where: { organizationId } }),
  ]);

  if (accounts === 0) {
    await db.financialAccount.create({
      data: { name: "Main account", organizationId },
    });
  }

  if (categories === 0) {
    await db.category.createMany({
      data: [
        ...expenseCategories.map((name) => ({
          name,
          type: "EXPENSE" as const,
          organizationId,
        })),
        ...incomeCategories.map((name) => ({
          name,
          type: "INCOME" as const,
          organizationId,
        })),
      ],
      skipDuplicates: true,
    });
  }
}