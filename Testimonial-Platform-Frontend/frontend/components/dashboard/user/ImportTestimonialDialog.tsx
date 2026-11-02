"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "@/components/common/StarRating";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { importTestimonial } from "@/app/(user)/_actions/testimonialApi";
import { importSchema } from "@/schemas/submitSc";
import { fieldErrors } from "@/schemas/userAuthSc";
import { getErrorMessage } from "@/lib/utils";

interface Props {
  open: boolean;
  spaceId: number;
  onClose: () => void;
  onAdded: () => void;
}

const empty = { name: "", job_title: "", company: "", message: "", rating: 5 };

/** Lets the owner paste a testimonial received somewhere else (e-mail, chat, social media) */
export function ImportTestimonialDialog({ open, spaceId, onClose, onAdded }: Props) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = importSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setSaving(true);
    try {
      await importTestimonial(spaceId, {
        name: form.name,
        message: form.message,
        job_title: form.job_title || undefined,
        company: form.company || undefined,
        rating: form.rating || undefined,
      });
      toast.success("Testimonial added");
      setForm(empty);
      onAdded();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a testimonial"
      description="Got praise by e-mail, chat or social media? Paste it here to use it on your wall.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Customer name" htmlFor="imp-name" error={errors.name}>
          <Input id="imp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Job title" htmlFor="imp-job">
            <Input id="imp-job" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
          </Field>
          <Field label="Company" htmlFor="imp-company">
            <Input id="imp-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
        </div>
        <Field label="Rating">
          <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size={24} />
        </Field>
        <Field label="Testimonial" htmlFor="imp-msg" error={errors.message}>
          <Textarea id="imp-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add testimonial"}</Button>
        </div>
      </form>
    </Modal>
  );
}
