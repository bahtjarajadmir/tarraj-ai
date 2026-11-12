"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentContext } from "@/lib/current-org";

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100, "Name is too long"),
  email: z.email("Enter a valid email").optional(),
  phone: z.string().trim().max(40, "Phone is too long").optional(),
  address: z.string().trim().max(200, "Address is too long").optional(),
});

export type CustomerFormState = { error?: string; success?: boolean };

function field(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? undefined : value;
}

export async function createCustomer(
  _prev: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const { organization } = await getCurrentContext();

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    address: field(formData, "address"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await (db as any).customer.create({
    data: { ...parsed.data, organizationId: organization.id },
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const { organization } = await getCurrentContext();

  await (db as any).customer.deleteMany({
    where: { id, organizationId: organization.id },
  });

  revalidatePath("/customers");
}