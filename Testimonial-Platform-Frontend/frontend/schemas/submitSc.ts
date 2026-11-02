import { z } from "zod";

export const importSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  message: z.string().trim().min(1, "Testimonial text is required"),
});
