"use client";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-[#F6F8FA]">
      <CardHeader>
        <Badge variant="neutral">Partner & admin sign-in</Badge>
        <CardTitle className="mt-5 text-3xl">Welcome back</CardTitle>
        <p className="mt-3 text-sm leading-6 text-copy-muted">Sign in to manage trips as a transportation partner or platform admin. Demo accounts below.</p>
      </CardHeader>
      <CardContent>
      <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-3">
        <Label className="block">
          Email
          <Input className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Label>
        <Label className="block">
          Password
          <Input
            type="password"
            className="mt-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Label>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <Button disabled={isPending} className="w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <div className="rounded-xl border border-line bg-white p-4 text-sm text-copy">
        <p className="font-semibold text-ink">Sample logins</p>
        <p className="mt-2">Platform admin: `admin@groupride.app` / `Admin123!`</p>
        <p>Transportation partner: `ops@charlottemobility.com` / `Operator123!`</p>
      </div>
    </form>
    </CardContent>
    </Card>
  );
}
