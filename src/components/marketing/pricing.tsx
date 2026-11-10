import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For freelancers getting started.",
    features: ["1 user", "100 transactions/month", "Basic reports", "10 AI questions/month"],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$29",
    description: "For growing small businesses.",
    features: [
      "5 users",
      "Unlimited transactions",
      "Invoicing and budgets",
      "Unlimited AI assistant",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$79",
    description: "For teams that need more control.",
    features: [
      "Unlimited users",
      "Advanced reports",
      "Audit logs",
      "Priority support",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Simple, honest pricing
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start free. Upgrade when your business grows.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-primary/60 shadow-[0_0_40px_rgba(16,185,129,0.12)]" : ""}
          >
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.highlighted && <Badge>Most popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <p className="num text-4xl font-semibold">
                {plan.price}
                <span className="text-base font-normal text-muted-foreground"> /month</span>
              </p>

              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}