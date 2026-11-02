import axios from "axios";
import { API_URL } from "@/lib/utils";
import type { PublicSpace, WallData } from "@/lib/types";

export const getPublicSpace = async (slug: string) =>
  (await axios.get<PublicSpace>(`${API_URL}/public/spaces/${slug}`)).data;

export const getWall = async (slug: string) =>
  (await axios.get<WallData>(`${API_URL}/public/wall/${slug}`)).data;

export interface SubmitPayload {
  name: string;
  email?: string;
  job_title?: string;
  company?: string;
  rating?: number;
  message?: string;
  consent: boolean;
  photo?: File | null;
  video?: File | null;
}

export async function submitTestimonial(slug: string, p: SubmitPayload) {
  const fd = new FormData();
  fd.append("name", p.name);
  if (p.email) fd.append("email", p.email);
  if (p.job_title) fd.append("job_title", p.job_title);
  if (p.company) fd.append("company", p.company);
  if (p.rating) fd.append("rating", String(p.rating));
  if (p.message) fd.append("message", p.message);
  fd.append("consent", String(p.consent));
  if (p.photo) fd.append("photo", p.photo);
  if (p.video) fd.append("video", p.video);
  return (await axios.post<{ success: boolean }>(`${API_URL}/public/spaces/${slug}/testimonials`, fd)).data;
}
