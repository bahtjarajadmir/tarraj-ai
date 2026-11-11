"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTransaction,
  type FormState,
} from "@/modules/transactions/actions";

type Option = { id: string; name: string };
type CategoryOption = Option & { type: "INCOME" | "EXPENSE" };

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TransactionForm({
  categories,
  accounts,
  defaultDate,
}: {
  categories: CategoryOption[];
  accounts: Option[];
  defaultDate: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createTransaction,
    {}
  );
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  const filtered = categories.filter((c) => c.type === type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
              className={selectClass}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="25.50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              key={type}
              id="categoryId"
              name="categoryId"
              className={selectClass}
              required
            >
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <select
              id="accountId"
              name="accountId"
              className={selectClass}
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional" />
          </div>

          <div className="flex items-center gap-4 md:col-span-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Add transaction"}
            </Button>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}