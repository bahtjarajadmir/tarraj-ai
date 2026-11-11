import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { StatCard } from "@/components/stat-card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const membership = await db.membership.findFirst({
    where: { userId },
    include: { organization: true },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <header className="flex items-center justify-between">
        <Logo />
        <SignOutButton />
      </header>

      <section className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {session!.user.name}
        </h1>
        <p className="text-muted-foreground">
          {membership?.organization.name} · {membership?.role}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Balance" value="€0.00" />
        <StatCard label="Revenue" value="€0.00" />
        <StatCard label="Expenses" value="€0.00" />
      </section>
    </main>
  );
}