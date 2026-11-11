import { AppShell } from "@/components/app/app-shell";
import { getCurrentContext } from "@/lib/current-org";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, organization } = await getCurrentContext();

  return (
    <AppShell organizationName={organization.name} userName={user.name}>
      {children}
    </AppShell>
  );
}