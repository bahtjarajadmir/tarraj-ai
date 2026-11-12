"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCustomer } from "@/modules/customers/actions";

export function DeleteCustomerButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this customer?")) {
          startTransition(() => deleteCustomer(id));
        }
      }}
    >
      <Trash2 className="size-4 text-muted-foreground" />
    </Button>
  );
}