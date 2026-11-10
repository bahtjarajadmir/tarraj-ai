import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.35)]">
        T
      </div>
      <span className="text-base font-semibold tracking-tight">
        TARRAJ <span className="text-primary">AI</span>
      </span>
    </div>
  );
}