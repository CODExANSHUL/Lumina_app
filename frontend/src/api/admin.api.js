import { api } from "./client";
export const adminApi = {
  createCategory: async (body) =>
    (await api.post("/admin/categories", body)).data,
  createVideo: async (uid, body) =>
    (
      await api.post("/admin/videos", body, {
        params: { uploaded_by: uid },
      })
    ).data,
  updateVideo: async (id, body) =>
    (await api.put(`/admin/videos/${id}`, body)).data,
  deleteVideo: async (id) => (await api.delete(`/admin/videos/${id}`)).data,
  createSeason: async (body) => (await api.post("/admin/seasons", body)).data,
  createEpisode: async (body) => (await api.post("/admin/episodes", body)).data,
  createPlan: async (body) => (await api.post("/admin/plans", body)).data,
};
