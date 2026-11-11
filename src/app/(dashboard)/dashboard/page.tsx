import { StatCard } from "@/components/stat-card";
import { getCurrentContext } from "@/lib/current-org";

export default async function DashboardPage() {
  const { user, organization } = await getCurrentContext();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {user.name}
        </h1>
        <p className="text-muted-foreground">{organization.name}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Balance" value="€0.00" />
        <StatCard label="Revenue" value="€0.00" />
        <StatCard label="Expenses" value="€0.00" />
      </section>
    </div>
  );
}