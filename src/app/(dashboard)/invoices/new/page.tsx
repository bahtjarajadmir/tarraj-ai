import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentContext } from "@/lib/current-org";
import { db } from "@/lib/db";
import { InvoiceForm } from "@/modules/invoices/invoice-form";

export default async function NewInvoicePage() {
  const { organization } = await getCurrentContext();

  const customers = await db.customer.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const now = new Date();
  const issue = now.toISOString().slice(0, 10);
  const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">New invoice</h1>
        <p className="text-muted-foreground">
          Add the customer, lines and due date.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          <p>You need at least one customer before creating an invoice.</p>
          <Link href="/customers">
            <Button>Add a customer</Button>
          </Link>
        </div>
      ) : (
        <InvoiceForm
          customers={customers}
          defaultIssue={issue}
          defaultDue={due}
          currency={organization.currency}
        />
      )}
    </div>
  );
}