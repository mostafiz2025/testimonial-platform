import api from "@/lib/axios";
import type { UserSummary } from "@/lib/types";

export const getProfile = async () => (await api.get<UserSummary>("/user/profile")).data;

export const updateProfile = async (data: { name?: string; company?: string }) =>
  (await api.patch<UserSummary>("/user/profile", data)).data;

export const uploadAvatar = async (file: File) => {
  const fd = new FormData();
  fd.append("myfile", file);
  return (await api.patch<UserSummary>("/user/avatar", fd)).data;
};

export const changePassword = async (data: { current_password: string; new_password: string }) =>
  (await api.patch<{ message: string }>("/user/password", data)).data;
