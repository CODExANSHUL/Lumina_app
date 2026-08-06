import { api } from "./client";
export const authApi = {
  login: async (body) => (await api.post("/auth/login", body)).data,
  register: async (body) => (await api.post("/auth/register", body)).data,
};
