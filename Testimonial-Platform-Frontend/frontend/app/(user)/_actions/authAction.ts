import axios from "axios";
import { API_URL } from "@/lib/utils";
import type { UserSummary } from "@/lib/types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
  company?: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserSummary;
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/user-auth/login`, data);
  return res.data;
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/user-auth/register`, data);
  return res.data;
}

export function saveSession(session: AuthResponse) {
  localStorage.setItem("access_token", session.access_token);
  localStorage.setItem("user", JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getStoredUser(): UserSummary | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
