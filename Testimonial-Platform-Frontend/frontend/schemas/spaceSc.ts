import { z } from "zod";

export const spaceSchema = z
  .object({
    name: z.string().trim().min(2, "Space name is required").max(100),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Only lowercase letters, numbers and hyphens")
      .min(3, "At least 3 characters")
      .max(60),
    header_title: z.string().trim().min(1, "Header title is required").max(200),
    custom_message: z.string().trim().min(1, "Message is required").max(1500),
    collect_text: z.boolean(),
    collect_video: z.boolean(),
  })
  .refine((v) => v.collect_text || v.collect_video, {
    message: "Turn on at least one of text or video testimonials",
    path: ["collect_text"],
  });
