import api from "@/lib/axios";
import type { Testimonial, TestimonialFilter, TestimonialList } from "@/lib/types";

export const getTestimonials = async (
  spaceId: number | string,
  params: { filter?: TestimonialFilter; search?: string; page?: number; limit?: number },
) => (await api.get<TestimonialList>(`/spaces/${spaceId}/testimonials`, { params })).data;

export const importTestimonial = async (
  spaceId: number | string,
  data: { name: string; message: string; job_title?: string; company?: string; rating?: number },
) => (await api.post<Testimonial>(`/spaces/${spaceId}/testimonials`, data)).data;

export const toggleLike = async (id: number) =>
  (await api.patch<{ id: number; is_liked: boolean }>(`/testimonials/${id}/like`)).data;

export const toggleArchive = async (id: number) =>
  (await api.patch<{ id: number; is_archived: boolean; is_liked: boolean }>(`/testimonials/${id}/archive`)).data;

export const deleteTestimonial = async (id: number) =>
  (await api.delete(`/testimonials/${id}`)).data;
