"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/app/(admin)/_actions/authAction";
import { fieldErrors, loginSchema } from "@/schemas/userAuthSc";
import { getErrorMessage } from "@/lib/utils";

export default function AdminLoginForm() {
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
      const res = await loginAdmin(parsed.data);
      localStorage.setItem("admin_access_token", res.access_token);
      toast.success("Welcome, admin");
      router.replace("/admin/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck />
        </span>
        <CardTitle className="text-xl">Admin panel</CardTitle>
        <CardDescription>Sign in with your administrator account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={values.email} aria-invalid={!!errors.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={values.password} aria-invalid={!!errors.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })} />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" className="h-10 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
