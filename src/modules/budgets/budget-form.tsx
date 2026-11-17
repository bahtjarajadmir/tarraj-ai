"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveBudget, type BudgetFormState } from "@/modules/budgets/actions";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function BudgetForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<BudgetFormState, FormData>(
    saveBudget,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a monthly budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              className={selectClass}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monthly limit</Label>
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="500"
              required
            />
          </div>

          <div className="flex items-end gap-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save budget"}
            </Button>
          </div>

          {state.error && (
            <p className="text-sm text-destructive md:col-span-3">
              {state.error}
            </p>
          )}
          <p className="text-xs text-muted-foreground md:col-span-3">
            Saving a category that already has a budget updates its limit.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}