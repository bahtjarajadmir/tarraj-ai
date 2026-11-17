"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteInvoice,
  markInvoicePaid,
  markInvoiceSent,
} from "@/modules/invoices/status-actions";

export function InvoiceActions({
  id,
  status,
}: {
  id: string;
  status: "DRAFT" | "SENT" | "PAID";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function run(action: (id: string) => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await action(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}

      {status === "DRAFT" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(markInvoiceSent)}
          >
            Mark as sent
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (confirm("Delete this draft invoice?")) run(deleteInvoice);
            }}
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </>
      )}

      {status === "SENT" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => {
            if (confirm("Mark as paid? This adds an income transaction.")) {
              run(markInvoicePaid);
            }
          }}
        >
          Mark as paid
        </Button>
      )}
    </div>
  );
}