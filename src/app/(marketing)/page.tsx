import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
        Financial clarity for your business, powered by AI.
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Coming soon. The full landing page is built in Phase 2.
      </p>
      <Link href="/design-system">
        <Button>View design system</Button>
      </Link>
    </main>
  );
}