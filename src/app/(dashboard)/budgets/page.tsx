import { Card, CardContent } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { BudgetForm } from "@/modules/budgets/budget-form";
import { DeleteBudgetButton } from "@/modules/budgets/delete-button";
import { ensureDefaults } from "@/modules/transactions/defaults";

export default async function BudgetsPage() {
  const { organization } = await getCurrentContext();
  await ensureDefaults(organization.id);
  const currency = organization.currency;

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const [categories, budgets, spentRows] = await Promise.all([
    db.category.findMany({
      where: { organizationId: organization.id, type: "EXPENSE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.budget.findMany({
      where: { organizationId: organization.id },
      include: { category: { select: { name: true } } },
    }),
    db.transaction.groupBy({
      by: ["categoryId"],
      where: {
        organizationId: organization.id,
        type: "EXPENSE",
        date: { gte: monthStart },
      },
      _sum: { amountCents: true },
    }),
  ]);

  const spentByCategory = new Map(
    spentRows.map((r) => [r.categoryId, r._sum.amountCents ?? 0])
  );

  const rows = budgets
    .map((b) => {
      const spent = spentByCategory.get(b.categoryId) ?? 0;
      return {
        id: b.id,
        name: b.category.name,
        limit: b.amountCents,
        spent,
        percent: (spent / b.amountCents) * 100,
      };
    })
    .sort((a, b) => b.percent - a.percent);

  const monthName = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Budgets</h1>
        <p className="text-muted-foreground">
          Monthly limits per category. Showing {monthName}.
        </p>
      </div>

      <BudgetForm categories={categories} />

      <Card>
        <CardContent className="space-y-6">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No budgets yet. Set your first one above.
            </p>
          ) : (
            rows.map((r) => {
              const over = r.spent > r.limit;
              const warning = !over && r.percent >= 80;
              const left = r.limit - r.spent;

              return (
                <div key={r.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="num text-muted-foreground">
                        {formatMoney(r.spent, currency)} of{" "}
                        {formatMoney(r.limit, currency)}
                      </span>
                      <DeleteBudgetButton id={r.id} />
                    </div>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        over
                          ? "bg-destructive"
                          : warning
                            ? "bg-amber-500"
                            : "bg-primary"
                      )}
                      style={{ width: `${Math.min(r.percent, 100)}%` }}
                    />
                  </div>

                  <p
                    className={cn(
                      "text-xs",
                      over
                        ? "text-destructive"
                        : warning
                          ? "text-amber-500"
                          : "text-muted-foreground"
                    )}
                  >
                    {over
                      ? `Over budget by ${formatMoney(-left, currency)}`
                      : warning
                        ? `Almost at the limit: ${formatMoney(left, currency)} left`
                        : `${formatMoney(left, currency)} left`}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}