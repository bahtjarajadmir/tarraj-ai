import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { MonthlyChart } from "@/modules/reports/charts";
import { getMonthlySeries } from "@/modules/reports/queries";

export default async function ReportsPage() {
  const { organization } = await getCurrentContext();
  const currency = organization.currency;

  const months = await getMonthlySeries(organization.id, 12);

  const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Profit and loss for the last 12 months.
        </p>
      </div>

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
          <CardTitle>Profit and loss</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Month</th>
                <th className="pb-3 text-right font-medium">Income</th>
                <th className="pb-3 text-right font-medium">Expenses</th>
                <th className="pb-3 text-right font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {[...months].reverse().map((m) => {
                const profit = m.income - m.expenses;
                return (
                  <tr key={m.key} className="border-b border-border">
                    <td className="py-3">{m.name}</td>
                    <td className="num py-3 text-right">
                      {formatMoney(m.income, currency)}
                    </td>
                    <td className="num py-3 text-right">
                      {formatMoney(m.expenses, currency)}
                    </td>
                    <td
                      className={cn(
                        "num py-3 text-right font-medium",
                        profit >= 0 ? "text-primary" : "text-destructive"
                      )}
                    >
                      {formatMoney(profit, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-3">Total</td>
                <td className="num pt-3 text-right">
                  {formatMoney(totalIncome, currency)}
                </td>
                <td className="num pt-3 text-right">
                  {formatMoney(totalExpenses, currency)}
                </td>
                <td
                  className={cn(
                    "num pt-3 text-right",
                    totalProfit >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {formatMoney(totalProfit, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}