"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDefaults } from "@/modules/transactions/defaults";

export async function createOrganization(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const clean = name.trim();
  if (clean.length < 2) throw new Error("Company name is too short");

  const organization = await db.organization.create({
    data: {
      name: clean,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  await ensureDefaults(organization.id);
}