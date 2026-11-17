import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { InvoiceActions } from "@/modules/invoices/invoice-actions";
import { StatusBadge } from "@/modules/invoices/status-badge";
import {
  formatInvoiceNumber,
  getDisplayStatus,
} from "@/modules/invoices/utils";

export default async function InvoicesPage() {
  const { organization } = await getCurrentContext();

  const invoices = await db.invoice.findMany({
    where: { organizationId: organization.id },
    include: { customer: { select: { name: true } } },
    orderBy: { number: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Create and track invoices.</p>
        </div>
        <Link href="/invoices/new">
          <Button>New invoice</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No invoices yet. Create your first one.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Number</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Issued</th>
                  <th className="pb-3 font-medium">Due</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">
                      {formatInvoiceNumber(inv.number)}
                    </td>
                    <td className="py-3">{inv.customer.name}</td>
                    <td className="py-3">
                      {inv.issueDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-3">
                      {inv.dueDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        status={getDisplayStatus(inv.status, inv.dueDate)}
                      />
                    </td>
                    <td className="num py-3 text-right font-medium">
                      {formatMoney(inv.totalCents, organization.currency)}
                    </td>
                    <td className="py-3">
                      <InvoiceActions id={inv.id} status={inv.status} />
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