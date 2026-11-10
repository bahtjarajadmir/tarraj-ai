import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
};

export function StatCard({ label, value, change, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="num text-3xl font-semibold">{value}</p>
        {change && (
          <p
            className={cn(
              "text-sm font-medium",
              trend === "up" && "text-primary",
              trend === "down" && "text-destructive"
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}