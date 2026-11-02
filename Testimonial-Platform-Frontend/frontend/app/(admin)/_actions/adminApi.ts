import api from "@/lib/adminAxios";
import type { AdminStats, Space, Testimonial, UserSummary } from "@/lib/types";

export const getAdminStats = async () => (await api.get<AdminStats>("/admin/stats")).data;
export const getAdminUsers = async () => (await api.get<UserSummary[]>("/admin/users")).data;
export const toggleBanUser = async (id: number) =>
  (await api.patch<{ id: number; is_banned: boolean }>(`/admin/users/${id}/ban`)).data;
export const deleteUser = async (id: number) => (await api.delete(`/admin/users/${id}`)).data;

export const getAdminSpaces = async () => (await api.get<Space[]>("/admin/spaces")).data;
export const deleteAdminSpace = async (id: number) => (await api.delete(`/admin/spaces/${id}`)).data;

export const getAdminTestimonials = async () =>
  (await api.get<Testimonial[]>("/admin/testimonials")).data;
export const deleteAdminTestimonial = async (id: number) =>
  (await api.delete(`/admin/testimonials/${id}`)).data;
