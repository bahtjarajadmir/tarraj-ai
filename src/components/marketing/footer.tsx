import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer>
      {/* Thirrja e fundit */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to understand your money?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Create your free account in under a minute.
          </p>
          <Button size="lg" className="mt-8">
            Get started free
          </Button>
        </div>
      </section>

      {/* Fundi */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
          © 2026 TARRAJ AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}