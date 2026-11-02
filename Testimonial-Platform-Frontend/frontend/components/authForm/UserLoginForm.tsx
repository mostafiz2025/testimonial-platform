"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, saveSession } from "@/app/(user)/_actions/authAction";
import { fieldErrors, loginSchema } from "@/schemas/userAuthSc";
import { getErrorMessage } from "@/lib/utils";

export default function UserLoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    try {
      saveSession(await loginUser(parsed.data));
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Logo />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Log in to your account</CardTitle>
          <CardDescription>Enter your e-mail and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@company.com"
                value={values.email} aria-invalid={!!errors.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••"
                value={values.password} aria-invalid={!!errors.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">Create a free account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
