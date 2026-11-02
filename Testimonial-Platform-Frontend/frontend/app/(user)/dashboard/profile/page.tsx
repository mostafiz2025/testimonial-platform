"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageSpinner } from "@/components/ui/spinner";
import { changePassword, getProfile, updateProfile, uploadAvatar } from "@/app/(user)/_actions/profileApi";
import { getStoredUser } from "@/app/(user)/_actions/authAction";
import { getErrorMessage } from "@/lib/utils";
import type { UserSummary } from "@/lib/types";

function syncStoredUser(u: UserSummary) {
  localStorage.setItem("user", JSON.stringify({ ...getStoredUser(), ...u }));
  window.dispatchEvent(new Event("user-updated"));
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [form, setForm] = useState({ name: "", company: "" });
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile().then((u) => {
      setUser(u);
      setForm({ name: u.name, company: u.company ?? "" });
    }).catch((e) => toast.error(getErrorMessage(e)));
  }, []);

  if (!user) return <PageSpinner />;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Name must be at least 2 characters");
    setSaving(true);
    try {
      const u = await updateProfile({ name: form.name, company: form.company });
      setUser(u);
      syncStoredUser(u);
      toast.success("Profile updated");
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be smaller than 2 MB");
    try {
      const u = await uploadAvatar(file);
      setUser(u);
      syncStoredUser(u);
      toast.success("Photo updated");
    } catch (err) { toast.error(getErrorMessage(err)); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.new_password.length < 8) return toast.error("New password must be at least 8 characters");
    setSavingPw(true);
    try {
      await changePassword(pw);
      toast.success("Password changed");
      setPw({ current_password: "", new_password: "" });
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSavingPw(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={user.name} src={user.profile_image} size={72} />
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change photo"
                className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border bg-background shadow">
                <Camera className="size-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatar} />
            </div>
            <p className="text-sm text-muted-foreground">JPG, PNG or WEBP, up to 2 MB.</p>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Name" htmlFor="p-name">
              <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Company" htmlFor="p-company">
              <Input id="p-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-4">
            <Field label="Current password" htmlFor="pw-cur">
              <Input id="pw-cur" type="password" autoComplete="current-password" value={pw.current_password}
                onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
            </Field>
            <Field label="New password" htmlFor="pw-new" hint="At least 8 characters">
              <Input id="pw-new" type="password" autoComplete="new-password" value={pw.new_password}
                onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
            </Field>
            <Button type="submit" disabled={savingPw}>{savingPw ? "Updating..." : "Update password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
