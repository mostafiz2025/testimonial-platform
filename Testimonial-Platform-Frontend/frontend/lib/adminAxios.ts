import axios from "axios";

/** Axios instance for the platform admin (token key: admin_access_token) */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      localStorage.getItem("admin_access_token")
    ) {
      localStorage.removeItem("admin_access_token");
      window.location.href = "/admin";
    }
    return Promise.reject(error);
  },
);

export default api;
