import axios from "axios";
import { API_URL } from "@/lib/utils";

export interface AdminLoginResponse {
  access_token: string;
  admin: { id: number; name: string; email: string };
}

export async function loginAdmin(data: { email: string; password: string }) {
  const res = await axios.post<AdminLoginResponse>(`${API_URL}/admin-auth/login`, data);
  return res.data;
}
