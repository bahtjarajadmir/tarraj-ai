export function PlaceholderPage({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        Coming in Phase {phase}.
      </div>
    </div>
  );
}