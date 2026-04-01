"use client";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@groupride.app");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);

  startTransition(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    // Platform admin
    if (
      normalizedEmail === "admin@groupride.app" &&
      password === "Admin123!"
    ) {
      router.push("/admin");
      router.refresh();
      return;
    }

    // Transportation partner
    if (
      normalizedEmail === "ops@charlottemobility.com" &&
      password === "Operator123!"
    ) {
      router.push("/operators");
      router.refresh();
      return;
    }

    setError("Invalid email or password.");
  });
};;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <Badge variant="neutral">Partner & admin sign-in</Badge>
        <CardTitle className="mt-4 text-3xl sm:text-4xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to manage trips, operators, pricing, and customer requests. Demo accounts are included below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          {error ? <p className="rounded-2xl border border-[#ead6d0] bg-[#f4e6e1] px-4 py-3 text-sm text-[#8c5d50]">{error}</p> : null}

          <Button disabled={isPending} size="lg" className="w-full">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>

          <div className="rounded-[1.75rem] border border-border bg-background/80 p-5 text-sm text-muted-foreground">
            <p className="premium-eyebrow">Sample logins</p>
            <p className="mt-3">
              Platform admin: <span className="text-foreground">admin@groupride.app / Admin123!</span>
            </p>
            <p className="mt-1">
              Transportation partner: <span className="text-foreground">ops@charlottemobility.com / Operator123!</span>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
