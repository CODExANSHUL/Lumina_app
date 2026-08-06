import { api } from "./client";
export const contentApi = {
  featured: async () => (await api.get("/content/featured")).data,
  latest: async () => (await api.get("/content/latest")).data,
  trending: async () => (await api.get("/content/trending")).data,
  categories: async () => (await api.get("/content/categories")).data,
  byCategory: async (id) => (await api.get(`/content/categories/${id}`)).data,
  video: async (id) => (await api.get(`/content/videos/${id}`)).data,
  similar: async (id) => (await api.get(`/content/videos/${id}/similar`)).data,
  seasons: async (id) => (await api.get(`/content/videos/${id}/seasons`)).data,
  episodes: async (id) =>
    (await api.get(`/content/seasons/${id}/episodes`)).data,
  search: async (keyword) =>
    (await api.get("/content/search", { params: { keyword } })).data,
};
