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
import { registerUser, saveSession } from "@/app/(user)/_actions/authAction";
import { fieldErrors, registerSchema } from "@/schemas/userAuthSc";
import { getErrorMessage } from "@/lib/utils";

export default function UserRegistrationForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", company: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    try {
      saveSession(await registerUser({ ...parsed.data, company: parsed.data.company || undefined }));
      toast.success("Account created!");
      router.replace("/dashboard/spaces/new");
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Logo />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Create your free account</CardTitle>
          <CardDescription>Start collecting testimonials in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="company" autoComplete="organization" value={values.company} onChange={set("company")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters"
                value={values.password} onChange={set("password")} aria-invalid={!!errors.password} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
