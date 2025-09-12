import axios from "axios";
import { getToken, clearToken } from "@/utils/authStorage";
import { useAuthUser } from "@/store/authUser";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearToken();
      try {
        useAuthUser.getState().clearUser();
      } catch {}
      if (typeof window !== "undefined") {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?redirectTo=${encodeURIComponent(next)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
