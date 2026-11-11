import { Card, CardContent } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { DeleteButton } from "@/modules/transactions/delete-button";
import { ensureDefaults } from "@/modules/transactions/defaults";
import { TransactionForm } from "@/modules/transactions/transaction-form";

export default async function TransactionsPage() {
  const { organization } = await getCurrentContext();
  await ensureDefaults(organization.id);

  const [categories, accounts, transactions] = await Promise.all([
    db.category.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
    }),
    db.financialAccount.findMany({
      where: { organizationId: organization.id },
      orderBy: { name: "asc" },
    }),
    db.transaction.findMany({
      where: { organizationId: organization.id },
      include: { category: true, account: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Record income and expenses.</p>
      </div>

      <TransactionForm
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        }))}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
        defaultDate={today}
      />

      <Card>
        <CardContent className="overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions yet. Add your first one above.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Account</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-3">
                      {t.date.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-3">{t.description ?? "-"}</td>
                    <td className="py-3">{t.category.name}</td>
                    <td className="py-3">{t.account.name}</td>
                    <td
                      className={cn(
                        "num py-3 text-right font-medium",
                        t.type === "INCOME" ? "text-primary" : "text-destructive"
                      )}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatMoney(t.amountCents, organization.currency)}
                    </td>
                    <td className="py-3 text-right">
                      <DeleteButton id={t.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}