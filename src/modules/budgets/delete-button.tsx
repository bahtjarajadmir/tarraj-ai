"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBudget } from "@/modules/budgets/actions";

export function DeleteBudgetButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this budget?")) {
          startTransition(() => deleteBudget(id));
        }
      }}
    >
      <Trash2 className="size-4 text-muted-foreground" />
    </Button>
  );
}