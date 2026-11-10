import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Bot,
  FileText,
  PiggyBank,
  Receipt,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI assistant",
    description:
      "Ask questions like 'Why did my expenses go up?' and get clear answers from your own data.",
  },
  {
    icon: Receipt,
    title: "Income and expenses",
    description:
      "Record every transaction, organize by category and see where your money goes.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description:
      "Create professional invoices, track who has paid and spot overdue payments early.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Profit and loss, cash flow and trends in simple charts anyone can understand.",
  },
  {
    icon: PiggyBank,
    title: "Budgets",
    description:
      "Set monthly limits per category and get warned before you overspend.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Every company's data is separated and protected. Only your team can see it.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Everything you need to run your finances
        </h2>
        <p className="mt-4 text-muted-foreground">
          One simple platform instead of messy spreadsheets.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="transition-colors hover:border-primary/40">
            <CardContent className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}