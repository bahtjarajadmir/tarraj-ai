import { z } from "zod";
import { db } from "@/lib/db";

export type ToolContext = { organizationId: string; currency: string };

const periodSchema = z
  .enum(["this_month", "last_month", "last_3_months", "this_year"])
  .default("this_month");

const periodArgs = z.object({ period: periodSchema });

const invoiceArgs = z.object({
  status: z
    .enum(["all", "draft", "sent", "paid", "overdue"])
    .default("all"),
});

function periodRange(period: z.infer<typeof periodSchema>) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  switch (period) {
    case "last_month":
      return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
    case "last_3_months":
      return { start: new Date(Date.UTC(y, m - 2, 1)), end: new Date(Date.UTC(y, m + 1, 1)) };
    case "this_year":
      return { start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y + 1, 0, 1)) };
    default:
      return { start: new Date(Date.UTC(y, m, 1)), end: new Date(Date.UTC(y, m + 1, 1)) };
  }
}

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

// Përshkrimet që i shfaqen modelit
export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "get_summary",
      description:
        "Total income, total expenses and profit for a period. Use for questions about revenue, spending or profit.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["this_month", "last_month", "last_3_months", "this_year"],
            description: "The time period. Default this_month.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_expenses_by_category",
      description:
        "Expenses grouped by category for a period, largest first. Use for questions about where money was spent.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["this_month", "last_month", "last_3_months", "this_year"],
            description: "The time period. Default this_month.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_invoices",
      description:
        "Count, total and the latest invoices, filtered by status. Use for questions about invoices, unpaid or overdue payments.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["all", "draft", "sent", "paid", "overdue"],
            description: "Invoice status filter. Default all.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_budget_status",
      description:
        "This month's budgets: limit, amount spent and amount left per category.",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function getSummary(ctx: ToolContext, args: unknown) {
  const { period } = periodArgs.parse(args ?? {});
  const { start, end } = periodRange(period);

  const rows = await db.transaction.groupBy({
    by: ["type"],
    where: { organizationId: ctx.organizationId, date: { gte: start, lt: end } },
    _sum: { amountCents: true },
  });

  let income = 0;
  let expenses = 0;
  for (const r of rows) {
    if (r.type === "INCOME") income = r._sum.amountCents ?? 0;
    else expenses = r._sum.amountCents ?? 0;
  }

  return {
    period,
    income: money(income, ctx.currency),
    expenses: money(expenses, ctx.currency),
    profit: money(income - expenses, ctx.currency),
  };
}

async function getExpensesByCategory(ctx: ToolContext, args: unknown) {
  const { period } = periodArgs.parse(args ?? {});
  const { start, end } = periodRange(period);

  const rows = await db.transaction.findMany({
    where: {
      organizationId: ctx.organizationId,
      type: "EXPENSE",
      date: { gte: start, lt: end },
    },
    select: { amountCents: true, category: { select: { name: true } } },
  });

  const totals = new Map<string, number>();
  for (const r of rows) {
    totals.set(r.category.name, (totals.get(r.category.name) ?? 0) + r.amountCents);
  }

  const categories = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, cents]) => ({ category: name, spent: money(cents, ctx.currency) }));

  return { period, categories };
}

async function getInvoices(ctx: ToolContext, args: unknown) {
  const { status } = invoiceArgs.parse(args ?? {});

  const today = new Date();
  const startOfToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const where = {
    organizationId: ctx.organizationId,
    ...(status === "draft" && { status: "DRAFT" as const }),
    ...(status === "sent" && { status: "SENT" as const }),
    ...(status === "paid" && { status: "PAID" as const }),
    // "Overdue" = i dërguar dhe me afat të kaluar (llogaritet, nuk ruhet)
    ...(status === "overdue" && {
      status: "SENT" as const,
      dueDate: { lt: startOfToday },
    }),
  };

  const [aggregate, latest] = await Promise.all([
    db.invoice.aggregate({
      where,
      _count: true,
      _sum: { totalCents: true },
    }),
    db.invoice.findMany({
      where,
      include: { customer: { select: { name: true } } },
      orderBy: { number: "desc" },
      take: 10,
    }),
  ]);

  return {
    filter: status,
    count: aggregate._count,
    total: money(aggregate._sum.totalCents ?? 0, ctx.currency),
    latest: latest.map((i) => ({
      number: `INV-${String(i.number).padStart(4, "0")}`,
      customer: i.customer.name,
      status: i.status,
      due: i.dueDate.toISOString().slice(0, 10),
      total: money(i.totalCents, ctx.currency),
    })),
  };
}

async function getBudgetStatus(ctx: ToolContext) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [budgets, spentRows] = await Promise.all([
    db.budget.findMany({
      where: { organizationId: ctx.organizationId },
      include: { category: { select: { name: true } } },
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: {
        organizationId: ctx.organizationId,
        type: "EXPENSE",
        date: { gte: start },
      },
      _sum: { amountCents: true },
    }),
  ]);

  const spentBy = new Map(
    spentRows.map((r) => [r.categoryId, r._sum.amountCents ?? 0])
  );

  return {
    budgets: budgets.map((b) => {
      const spent = spentBy.get(b.categoryId) ?? 0;
      return {
        category: b.category.name,
        limit: money(b.amountCents, ctx.currency),
        spent: money(spent, ctx.currency),
        left: money(b.amountCents - spent, ctx.currency),
        overBudget: spent > b.amountCents,
      };
    }),
  };
}

// Ekzekuton vetëm mjetet e lejuara. Çdo gabim kthehet si tekst për modelin.
export async function runTool(
  name: string,
  args: unknown,
  ctx: ToolContext
): Promise<string> {
  try {
    switch (name) {
      case "get_summary":
        return JSON.stringify(await getSummary(ctx, args));
      case "get_expenses_by_category":
        return JSON.stringify(await getExpensesByCategory(ctx, args));
      case "get_invoices":
        return JSON.stringify(await getInvoices(ctx, args));
      case "get_budget_status":
        return JSON.stringify(await getBudgetStatus(ctx));
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch {
    return JSON.stringify({
      error: "Invalid arguments. Use only the values listed in the tool description.",
    });
  }
}