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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to sign in.");
        return;
      }
      router.push(payload.redirectTo ?? "/");
      router.refresh();
    });
  };

  return (
    <Card className="bg-[#F6F8FA]">
      <CardHeader>
        <Badge variant="neutral">Internal access</Badge>
        <CardTitle className="mt-5 text-3xl">Sign in to GroupRide</CardTitle>
        <p className="mt-3 text-sm leading-6 text-copy-muted">Use demo credentials to explore operator and admin workflows.</p>
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
        <p className="font-semibold text-ink">Demo accounts</p>
        <p className="mt-2">Admin: `admin@groupride.app` / `Admin123!`</p>
        <p>Operator: `ops@charlottemobility.com` / `Operator123!`</p>
      </div>
    </form>
    </CardContent>
    </Card>
  );
}
