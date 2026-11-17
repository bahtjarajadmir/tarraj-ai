"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/money";
import { createInvoice } from "@/modules/invoices/actions";

type Line = { description: string; quantity: string; price: string };

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InvoiceForm({
  customers,
  defaultIssue,
  defaultDue,
  currency,
}: {
  customers: { id: string; name: string }[];
  defaultIssue: string;
  defaultDue: string;
  currency: string;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([
    { description: "", quantity: "1", price: "" },
  ]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function update(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  }

  const totalCents = lines.reduce((sum, l) => {
    const q = parseInt(l.quantity, 10);
    const p = parseFloat(l.price.replace(",", "."));
    if (!Number.isFinite(q) || !Number.isFinite(p)) return sum;
    return sum + Math.round(q * p * 100);
  }, 0);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(e.currentTarget);
    const result = await createInvoice({
      customerId: String(form.get("customerId") ?? ""),
      issueDate: String(form.get("issueDate") ?? ""),
      dueDate: String(form.get("dueDate") ?? ""),
      notes: String(form.get("notes") ?? "").trim() || undefined,
      items: lines.map((l) => {
        const q = parseInt(l.quantity, 10);
        return {
          description: l.description,
          quantity: Number.isNaN(q) ? 0 : q,
          price: l.price.trim().replace(",", "."),
        };
      }),
    });

    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/invoices");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <select
              id="customerId"
              name="customerId"
              className={selectClass}
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              name="issueDate"
              type="date"
              defaultValue={defaultIssue}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={defaultDue}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 items-end gap-3">
              <div className="col-span-12 space-y-2 md:col-span-6">
                {i === 0 && <Label>Description</Label>}
                <Input
                  value={line.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  placeholder="Website design"
                />
              </div>
              <div className="col-span-4 space-y-2 md:col-span-2">
                {i === 0 && <Label>Qty</Label>}
                <Input
                  value={line.quantity}
                  onChange={(e) => update(i, { quantity: e.target.value })}
                  inputMode="numeric"
                />
              </div>
              <div className="col-span-6 space-y-2 md:col-span-3">
                {i === 0 && <Label>Unit price</Label>}
                <Input
                  value={line.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                  inputMode="decimal"
                  placeholder="100.00"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setLines((prev) => [
                ...prev,
                { description: "", quantity: "1", price: "" },
              ])
            }
          >
            <Plus className="size-4" /> Add line
          </Button>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-muted-foreground">Total</span>
            <span className="num text-2xl font-semibold">
              {formatMoney(totalCents, currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Optional" />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Create invoice"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </form>
  );
}