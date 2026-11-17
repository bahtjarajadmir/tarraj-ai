import { Badge } from "@/components/ui/badge";
import type { DisplayStatus } from "@/modules/invoices/utils";

const config: Record<
  DisplayStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Sent", variant: "outline" },
  PAID: { label: "Paid", variant: "default" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}