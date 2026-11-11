import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CategoryChart, MonthlyChart } from "@/modules/reports/charts";
import {
  getBalance,
  getExpensesByCategory,
  getMonthlySeries,
  getRecentTransactions,
} from "@/modules/reports/queries";

function change(current: number, previous: number) {
  if (previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs last month`;
}

export default async function DashboardPage() {
  const { user, organization } = await getCurrentContext();
  const currency = organization.currency;

  const [balance, months, categories, recent] = await Promise.all([
    getBalance(organization.id),
    getMonthlySeries(organization.id, 6),
    getExpensesByCategory(organization.id),
    getRecentTransactions(organization.id, 5),
  ]);

  const current = months[months.length - 1];
  const previous = months[months.length - 2];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {user.name}
        </h1>
        <p className="text-muted-foreground">{organization.name}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Balance" value={formatMoney(balance, currency)} />
        <StatCard
          label="Revenue this month"
          value={formatMoney(current.income, currency)}
          change={change(current.income, previous.income)}
          trend={current.income >= previous.income ? "up" : "down"}
        />
        <StatCard
          label="Expenses this month"
          value={formatMoney(current.expenses, currency)}
          change={change(current.expenses, previous.expenses)}
          trend={current.expenses <= previous.expenses ? "up" : "down"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={months} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category (this month)</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="py-24 text-center text-sm text-muted-foreground">
                No expenses this month yet.
              </p>
            ) : (
              <CategoryChart data={categories} currency={currency} />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {t.description ?? t.category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.category.name} · {t.date.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "num font-medium",
                      t.type === "INCOME" ? "text-primary" : "text-destructive"
                    )}
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatMoney(t.amountCents, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}