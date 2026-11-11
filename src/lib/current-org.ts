import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const getCurrentContext = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) redirect("/login");

  return {
    user: session.user,
    organization: membership.organization,
    role: membership.role,
  };
});