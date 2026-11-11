import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentContext } from "@/lib/current-org";

export default async function SettingsPage() {
  const { user, organization, role } = await getCurrentContext();

  const rows = [
    ["Company", organization.name],
    ["Currency", organization.currency],
    ["Country", organization.country ?? "Not set"],
    ["Your name", user.name],
    ["Your email", user.email],
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Your company and account.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Company details <Badge>{role}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}