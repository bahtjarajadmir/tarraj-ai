import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

const bars = [40, 65, 50, 80, 60, 90, 75, 95];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Shkëlqimi emerald në sfond */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
        <Badge variant="outline" className="mb-6 gap-1.5">
          <Sparkles className="size-3 text-primary" />
          AI-powered finance for small business
        </Badge>

        <h1 className="mx-auto max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
          Financial clarity,{" "}
          <span className="text-primary">powered by AI.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Track income, send invoices and ask questions about your money in
          plain language. TARRAJ AI is your always-on finance assistant.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg">
            Start for free <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline">
            See how it works
          </Button>
        </div>

        {/* Mockup i dashboard-it */}
        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-border bg-card p-6 text-left shadow-2xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="num mt-1 text-2xl font-semibold">$48,250.00</p>
              <p className="mt-1 text-sm text-primary">+12.4% this month</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="num mt-1 text-2xl font-semibold">$21,800.00</p>
              <p className="mt-1 text-sm text-primary">+8.1% this month</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="num mt-1 text-2xl font-semibold">$9,430.00</p>
              <p className="mt-1 text-sm text-destructive">+3.2% this month</p>
            </div>
          </div>

          <div className="mt-4 flex h-40 items-end gap-3 rounded-xl border border-border bg-background p-4">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-primary/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}