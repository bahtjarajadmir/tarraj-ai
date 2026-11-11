"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/modules/transactions/actions";

export function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this transaction?")) {
          startTransition(() => deleteTransaction(id));
        }
      }}
    >
      <Trash2 className="size-4 text-muted-foreground" />
    </Button>
  );
}