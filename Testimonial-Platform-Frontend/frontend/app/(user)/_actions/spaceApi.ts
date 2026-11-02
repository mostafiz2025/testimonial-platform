import api from "@/lib/axios";
import type { Space, SpaceInput, UserStats } from "@/lib/types";

export const getStats = async () => (await api.get<UserStats>("/user/stats")).data;

export const getSpaces = async () => (await api.get<Space[]>("/spaces")).data;

export const getSpace = async (id: number | string) =>
  (await api.get<Space>(`/spaces/${id}`)).data;

export const createSpace = async (data: Partial<SpaceInput> & { name: string; slug?: string }) =>
  (await api.post<Space>("/spaces", data)).data;

export const updateSpace = async (id: number | string, data: Partial<SpaceInput> & { slug?: string }) =>
  (await api.patch<Space>(`/spaces/${id}`, data)).data;

export const uploadSpaceLogo = async (id: number | string, file: File) => {
  const fd = new FormData();
  fd.append("logo", file);
  return (await api.patch<Space>(`/spaces/${id}/logo`, fd)).data;
};

export const deleteSpace = async (id: number | string) =>
  (await api.delete(`/spaces/${id}`)).data;
