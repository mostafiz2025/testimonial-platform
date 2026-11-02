"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CollectionHeader } from "@/components/public/CollectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createSpace, updateSpace, uploadSpaceLogo } from "@/app/(user)/_actions/spaceApi";
import { fieldErrors } from "@/schemas/userAuthSc";
import { spaceSchema } from "@/schemas/spaceSc";
import { assetUrl, getErrorMessage, slugify, siteUrl } from "@/lib/utils";
import type { Space } from "@/lib/types";

interface Props {
  mode: "create" | "edit";
  initial?: Space;
  onSaved?: (space: Space) => void;
}

const DEFAULT_QUESTIONS = [
  "Who are you, and what do you do?",
  "How has our product / service helped you?",
  "What is the best thing about it?",
];

const toggles: { key: keyof Space; label: string; hint: string }[] = [
  { key: "collect_video", label: "Video testimonials", hint: "Let people record or upload a video" },
  { key: "collect_text", label: "Text testimonials", hint: "Let people write a testimonial" },
  { key: "collect_star_rating", label: "Star rating", hint: "Ask for a 1–5 star rating" },
  { key: "collect_email", label: "E-mail address", hint: "Required so you can follow up" },
  { key: "collect_job_title", label: "Job title", hint: "e.g. Product Manager" },
  { key: "collect_company", label: "Company", hint: "e.g. Acme Inc." },
  { key: "collect_photo", label: "Profile photo", hint: "Optional photo upload for text testimonials" },
];

export function SpaceForm({ mode, initial, onSaved }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    header_title: initial?.header_title ?? "",
    custom_message: initial?.custom_message ?? "We would love to hear what you think. It only takes a minute!",
    questions: initial?.questions ?? DEFAULT_QUESTIONS,
    collect_text: initial?.collect_text ?? true,
    collect_video: initial?.collect_video ?? true,
    collect_star_rating: initial?.collect_star_rating ?? true,
    collect_email: initial?.collect_email ?? true,
    collect_company: initial?.collect_company ?? true,
    collect_job_title: initial?.collect_job_title ?? true,
    collect_photo: initial?.collect_photo ?? true,
    thank_you_title: initial?.thank_you_title ?? "Thank you!",
    thank_you_message: initial?.thank_you_message ?? "Thanks so much for your testimonial! It means a lot to us.",
    button_color: initial?.button_color ?? "#6366f1",
    is_active: initial?.is_active ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!logoFile) return setLogoPreview(null);
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function onNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugify(name),
      header_title: mode === "create" && !f.header_title ? "" : f.header_title,
    }));
  }

  const preview = useMemo(
    () => ({
      ...form,
      logo: initial?.logo ?? null,
      logoPreview,
      header_title: form.header_title || (form.name ? `Share your experience with ${form.name}` : ""),
    }),
    [form, initial?.logo, logoPreview],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      header_title: form.header_title.trim() || `Share your experience with ${form.name.trim()}`,
      questions: form.questions.map((q) => q.trim()).filter(Boolean),
    };
    const parsed = spaceSchema.safeParse(payload);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    try {
      let saved =
        mode === "create" ? await createSpace(payload) : await updateSpace(initial!.id, payload);
      if (logoFile) saved = await uploadSpaceLogo(saved.id, logoFile);
      toast.success(mode === "create" ? "Space created!" : "Changes saved");
      if (mode === "create") router.replace(`/dashboard/spaces/${saved.id}`);
      else {
        setLogoFile(null);
        onSaved?.(saved);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the space"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]" noValidate>
      <div className="space-y-6">
        {/* basics */}
        <Card>
          <CardHeader>
            <CardTitle>Space details</CardTitle>
            <CardDescription>Your space is the project or product you collect testimonials for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Space name" htmlFor="name" error={errors.name}>
              <Input id="name" value={form.name} placeholder="e.g. Acme Inc." onChange={(e) => onNameChange(e.target.value)} />
            </Field>
            <Field label="Public URL" htmlFor="slug" error={errors.slug}
              hint={`${siteUrl()}/s/${form.slug || "your-space"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/s/</span>
                <Input id="slug" value={form.slug}
                  onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
              </div>
            </Field>
            <Field label="Logo">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-3 hover:bg-muted/50">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ImagePlus className="size-5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {logoFile ? logoFile.name : initial?.logo ? "Change logo" : "Upload a logo (max 2 MB)"}
                </span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > 2 * 1024 * 1024) return toast.error("Logo must be smaller than 2 MB");
                    setLogoFile(f ?? null);
                  }} />
              </label>
              {initial?.logo && !logoFile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetUrl(initial.logo)} alt="Current logo" className="mt-2 size-12 rounded-xl object-cover" />
              )}
            </Field>
          </CardContent>
        </Card>

        {/* page content */}
        <Card>
          <CardHeader>
            <CardTitle>Collection page</CardTitle>
            <CardDescription>What your customers see when they open the link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Header title" htmlFor="header_title" error={errors.header_title}>
              <Input id="header_title" value={form.header_title}
                placeholder={form.name ? `Share your experience with ${form.name}` : "Share your experience"}
                onChange={(e) => set("header_title", e.target.value)} />
            </Field>
            <Field label="Your custom message" htmlFor="custom_message" error={errors.custom_message}>
              <Textarea id="custom_message" value={form.custom_message}
                onChange={(e) => set("custom_message", e.target.value)} />
            </Field>
            <Field label="Questions" hint="Short prompts that help people write a great testimonial (max 8).">
              <div className="space-y-2">
                {form.questions.map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={q} placeholder={`Question ${i + 1}`}
                      onChange={(e) => set("questions", form.questions.map((x, j) => (j === i ? e.target.value : x)))} />
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove question"
                      onClick={() => set("questions", form.questions.filter((_, j) => j !== i))}>
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {form.questions.length < 8 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => set("questions", [...form.questions, ""])}>
                    <Plus /> Add question
                  </Button>
                )}
              </div>
            </Field>
            <Field label="Button color" htmlFor="button_color">
              <div className="flex items-center gap-3">
                <input id="button_color" type="color" value={form.button_color}
                  onChange={(e) => set("button_color", e.target.value)}
                  className="size-10 cursor-pointer rounded-xl border bg-transparent p-1" />
                <Input value={form.button_color} className="max-w-32"
                  onChange={(e) => set("button_color", e.target.value)} />
              </div>
            </Field>
          </CardContent>
        </Card>

        {/* what to collect */}
        <Card>
          <CardHeader>
            <CardTitle>What do you want to collect?</CardTitle>
            {errors.collect_text && <p className="text-xs text-destructive">{errors.collect_text}</p>}
          </CardHeader>
          <CardContent className="divide-y">
            {toggles.map((t) => (
              <div key={t.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.hint}</p>
                </div>
                <Switch aria-label={t.label} checked={form[t.key as keyof typeof form] as boolean}
                  onCheckedChange={(v) => set(t.key as keyof typeof form, v as never)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* thank you */}
        <Card>
          <CardHeader>
            <CardTitle>Thank-you page</CardTitle>
            <CardDescription>Shown after someone submits a testimonial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title" htmlFor="ty_title">
              <Input id="ty_title" value={form.thank_you_title} onChange={(e) => set("thank_you_title", e.target.value)} />
            </Field>
            <Field label="Message" htmlFor="ty_msg">
              <Textarea id="ty_msg" value={form.thank_you_message} onChange={(e) => set("thank_you_message", e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        {mode === "edit" && (
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Accept new testimonials</p>
                <p className="text-xs text-muted-foreground">Turn off to pause the collection page and Wall of Love.</p>
              </div>
              <Switch aria-label="Active" checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="submit" size="lg" className="h-11 px-8" disabled={saving}>
            {saving ? "Saving..." : mode === "create" ? "Create space" : "Save changes"}
          </Button>
          {mode === "create" && (
            <Button type="button" variant="ghost" size="lg" className="h-11" onClick={() => router.back()}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* live preview */}
      <div className="hidden xl:block">
        <div className="sticky top-6">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Live preview</p>
          <div className="rounded-[2rem] border bg-white p-8 shadow-lg">
            <CollectionHeader space={preview} />
          </div>
        </div>
      </div>
    </form>
  );
}
