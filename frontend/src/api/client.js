import axios from "axios";
import { useAuthStore } from "../store/auth";
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://lumina-app-cg5b.onrender.com"
).replace(/\/$/, "");
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      if (location.pathname !== "/login")
        location.assign(
          `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`,
        );
    }
    return Promise.reject(error);
  },
);
export function apiError(error) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((x) => x.msg).join(", ");
    if (typeof detail === "string") return detail;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === "ECONNABORTED")
      return "The request timed out. Please try again.";
    if (!error.response)
      return "Unable to reach the server. Check your connection.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
