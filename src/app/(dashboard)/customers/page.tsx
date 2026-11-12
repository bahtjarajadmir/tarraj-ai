import { Card, CardContent } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";
import { db } from "@/lib/db";
import { CustomerForm } from "@/modules/customers/customer-form";
import { DeleteCustomerButton } from "@/modules/customers/delete-button";

export default async function CustomersPage() {
  const { organization } = await getCurrentContext();

  const customers = await db.customer.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          People and companies you invoice.
        </p>
      </div>

      <CustomerForm />

      <Card>
        <CardContent className="overflow-x-auto">
          {customers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No customers yet. Add your first one above.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Address</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">{c.email ?? "-"}</td>
                    <td className="py-3">{c.phone ?? "-"}</td>
                    <td className="py-3">{c.address ?? "-"}</td>
                    <td className="py-3 text-right">
                      <DeleteCustomerButton id={c.id} />
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
