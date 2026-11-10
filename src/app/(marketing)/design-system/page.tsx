import { Logo } from "@/components/brand/logo";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const colors = [
  { name: "Background", hex: "#090D12" },
  { name: "Surface", hex: "#151D24" },
  { name: "Primary", hex: "#10B981" },
  { name: "Text", hex: "#FFFFFF" },
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <header className="space-y-4">
        <Logo />
        <h1 className="text-4xl font-semibold tracking-tight">Design System</h1>
        <p className="text-muted-foreground">
          Midnight Emerald. Components for TARRAJ AI.
        </p>
      </header>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Colors</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {colors.map((c) => (
            <div key={c.name} className="space-y-2">
              <div
                className="h-20 rounded-xl border border-border"
                style={{ backgroundColor: c.hex }}
              />
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Create invoice</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Status badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Paid</Badge>
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="outline">Sent</Badge>
          <Badge variant="destructive">Overdue</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stat cards</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Balance" value="$48,250.00" change="+12.4% this month" trend="up" />
          <StatCard label="Revenue" value="$21,800.00" change="+8.1% this month" trend="up" />
          <StatCard label="Expenses" value="$9,430.00" change="+3.2% this month" trend="down" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Form</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>New customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" placeholder="Acme Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="billing@acme.com" />
            </div>
            <Button className="w-full">Save customer</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}