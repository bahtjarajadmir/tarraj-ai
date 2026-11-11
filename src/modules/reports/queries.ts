import { db } from "@/lib/db";

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function lastMonths(count: number) {
  const now = new Date();
  const list = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
    );
    const short = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    list.push({
      key: monthKey(date),
      label: short,
      name: `${short} ${date.getUTCFullYear()}`,
      date,
    });
  }
  return list;
}

export type MonthRow = {
  key: string;
  label: string;
  name: string;
  income: number;
  expenses: number;
};

// Të ardhura dhe shpenzime për secilin nga muajt e fundit (në centë)
export async function getMonthlySeries(
  organizationId: string,
  count = 6
): Promise<MonthRow[]> {
  const months = lastMonths(count);

  const rows = await db.transaction.findMany({
    where: { organizationId, date: { gte: months[0].date } },
    select: { type: true, amountCents: true, date: true },
  });

  const buckets = new Map<string, MonthRow>(
    months.map((m) => [
      m.key,
      { key: m.key, label: m.label, name: m.name, income: 0, expenses: 0 },
    ])
  );

  for (const r of rows) {
    const bucket = buckets.get(monthKey(r.date));
    if (!bucket) continue;
    if (r.type === "INCOME") bucket.income += r.amountCents;
    else bucket.expenses += r.amountCents;
  }

  return months.map((m) => buckets.get(m.key)!);
}

// Balanca totale: gjithë të ardhurat minus gjithë shpenzimet
export async function getBalance(organizationId: string) {
  const rows = await db.transaction.groupBy({
    by: ["type"],
    where: { organizationId },
    _sum: { amountCents: true },
  });

  let income = 0;
  let expenses = 0;
  for (const r of rows) {
    if (r.type === "INCOME") income = r._sum.amountCents ?? 0;
    else expenses = r._sum.amountCents ?? 0;
  }
  return income - expenses;
}

// Shpenzimet e muajit aktual sipas kategorisë (top 6)
export async function getExpensesByCategory(organizationId: string) {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const rows = await db.transaction.findMany({
    where: { organizationId, type: "EXPENSE", date: { gte: start } },
    select: { amountCents: true, category: { select: { name: true } } },
  });

  const totals = new Map<string, number>();
  for (const r of rows) {
    totals.set(
      r.category.name,
      (totals.get(r.category.name) ?? 0) + r.amountCents
    );
  }

  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
}

export async function getRecentTransactions(organizationId: string, take = 5) {
  return db.transaction.findMany({
    where: { organizationId },
    include: { category: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take,
  });
}