"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCustomer,
  type CustomerFormState,
} from "@/modules/customers/actions";

export function CustomerForm() {
  const [state, action, pending] = useActionState<CustomerFormState, FormData>(
    createCustomer,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Acme Inc." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="billing@acme.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="Optional" />
          </div>

          <div className="flex items-center gap-4 md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Add customer"}
            </Button>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}