"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "@/components/common/StarRating";
import { CollectionHeader } from "@/components/public/CollectionHeader";
import { VideoRecorder } from "@/components/public/VideoRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageSpinner } from "@/components/ui/spinner";
import { getPublicSpace, submitTestimonial } from "@/app/(public)/_actions/publicApi";
import { APP_NAME } from "@/lib/config";
import { getErrorMessage } from "@/lib/utils";
import type { PublicSpace } from "@/lib/types";

type Mode = "home" | "text" | "video" | "done";

export default function CollectionPage({ slug }: { slug: string }) {
  const [space, setSpace] = useState<PublicSpace | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<Mode>("home");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", job_title: "", company: "", message: "", rating: 0, consent: false });
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getPublicSpace(slug).then(setSpace).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-5xl font-bold text-primary">404</p>
        <p className="text-lg font-semibold">This page does not exist</p>
        <p className="text-sm text-muted-foreground">The link may be wrong, or the owner paused this page.</p>
      </div>
    );
  if (!space) return <PageSpinner />;

  const color = space.button_color;
  const set = (k: keyof typeof form, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (space!.collect_email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid e-mail";
    if (mode === "text" && !form.message.trim()) e.message = "Please write your testimonial";
    if (mode === "video" && !video) e.video = "Please record or upload a video";
    if (space!.collect_star_rating && mode === "text" && !form.rating) e.rating = "Please choose a rating";
    if (!form.consent) e.consent = "Please give your permission";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitTestimonial(slug, {
        name: form.name.trim(),
        email: space!.collect_email ? form.email.trim() : undefined,
        job_title: space!.collect_job_title ? form.job_title.trim() : undefined,
        company: space!.collect_company ? form.company.trim() : undefined,
        rating: space!.collect_star_rating && form.rating ? form.rating : undefined,
        message: form.message.trim() || undefined,
        consent: form.consent,
        photo: mode === "text" || space!.collect_photo ? photo : null,
        video: mode === "video" ? video : null,
      });
      setMode("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not send your testimonial. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900 sm:py-16">
      <div className="mx-auto w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-xl sm:p-10">
        {mode === "home" && (
          <CollectionHeader space={space} onText={() => setMode("text")} onVideo={() => setMode("video")} />
        )}

        {mode === "done" && (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-16" style={{ color }} />
            <h1 className="mt-5 text-2xl font-bold">{space.thank_you_title}</h1>
            <p className="mx-auto mt-3 max-w-sm whitespace-pre-line text-neutral-600">{space.thank_you_message}</p>
          </div>
        )}

        {(mode === "text" || mode === "video") && (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <button type="button" onClick={() => setMode("home")}
              className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
              <ArrowLeft className="size-4" /> Back
            </button>
            <h2 className="text-xl font-bold">
              {mode === "video" ? "Record your video testimonial" : "Write your testimonial"}
            </h2>

            {mode === "video" && (
              <div className="space-y-2">
                <VideoRecorder color={color} value={video} onChange={setVideo} />
                {errors.video && <p className="text-xs text-red-600">{errors.video}</p>}
              </div>
            )}

            {space.collect_star_rating && (
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <StarRating value={form.rating} onChange={(v) => set("rating", v)} size={30} />
                {errors.rating && <p className="text-xs text-red-600">{errors.rating}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="message">
                {mode === "video" ? "Anything to add? (optional)" : "Your testimonial"}
              </Label>
              <Textarea id="message" value={form.message} maxLength={3000}
                placeholder={mode === "text" && space.questions[0] ? space.questions[0] : "Write here..."}
                aria-invalid={!!errors.message} onChange={(e) => set("message", e.target.value)} />
              {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={form.name} aria-invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>
              {space.collect_email && (
                <div className="space-y-1.5">
                  <Label htmlFor="email">Your e-mail</Label>
                  <Input id="email" type="email" value={form.email} aria-invalid={!!errors.email}
                    onChange={(e) => set("email", e.target.value)} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>
              )}
              {space.collect_job_title && (
                <div className="space-y-1.5">
                  <Label htmlFor="job">Job title</Label>
                  <Input id="job" value={form.job_title} onChange={(e) => set("job_title", e.target.value)} />
                </div>
              )}
              {space.collect_company && (
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company} onChange={(e) => set("company", e.target.value)} />
                </div>
              )}
            </div>

            {space.collect_photo && (
              <div className="space-y-1.5">
                <Label>Your photo (optional)</Label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-3 hover:bg-neutral-50">
                  <ImagePlus className="size-5 text-neutral-400" />
                  <span className="truncate text-sm text-neutral-600">{photo ? photo.name : "Choose an image (max 5 MB)"}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && f.size > 5 * 1024 * 1024) return toast.error("Photo must be smaller than 5 MB");
                      setPhoto(f ?? null);
                    }} />
                </label>
              </div>
            )}

            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-600">
                <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 size-4 rounded" style={{ accentColor: color }} />
                I give {space.name} permission to use my testimonial across social channels and other marketing efforts.
              </label>
              {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
            </div>

            <Button type="submit" disabled={submitting} style={{ backgroundColor: color }}
              className="h-12 w-full text-base text-white hover:opacity-90">
              {submitting ? (mode === "video" ? "Uploading video..." : "Sending...") : "Send"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">Powered by {APP_NAME}</p>
    </main>
  );
}
