import { api } from "./client";
export const userApi = {
  profiles: async (userId) => (await api.get(`/users/${userId}/profiles`)).data,
  createProfile: async (userId, body) =>
    (await api.post(`/users/${userId}/profiles`, body)).data,
  updateProfile: async (id, body) =>
    (await api.put(`/users/profiles/${id}`, body)).data,
  deleteProfile: async (id) => (await api.delete(`/users/profiles/${id}`)).data,
  watchlist: async (id) =>
    (await api.get(`/users/profiles/${id}/watchlist`)).data,
  addWatchlist: async (pid, vid) =>
    (await api.post(`/users/profiles/${pid}/watchlist/${vid}`)).data,
  removeWatchlist: async (pid, vid) =>
    (await api.delete(`/users/profiles/${pid}/watchlist/${vid}`)).data,
  continueWatching: async (id) =>
    (await api.get(`/users/profiles/${id}/continue`)).data,
  removeContinueWatching: async (pid, vid) =>
    (await api.delete(`/users/profiles/${pid}/history/${vid}`)).data,
  saveProgress: async (pid, vid, watched, total) =>
    (
      await api.post(`/users/profiles/${pid}/history/${vid}`, null, {
        params: {
          watched_seconds: Math.round(watched),
          total_seconds: Math.round(total),
        },
      })
    ).data,
  review: async (pid, vid, rating, comment) =>
    (
      await api.post(`/users/profiles/${pid}/reviews/${vid}`, null, {
        params: { rating, comment },
      })
    ).data,
  like: async (pid, vid) =>
    (await api.post(`/users/profiles/${pid}/likes/${vid}`)).data,
  saveSearch: async (pid, text) =>
    (
      await api.post(`/users/profiles/${pid}/search`, null, {
        params: { text },
      })
    ).data,
  share: async (pid, vid, platform, url) =>
    (
      await api.post(`/users/profiles/${pid}/share/${vid}`, null, {
        params: { platform, url },
      })
    ).data,
  notifications: async (uid) =>
    (await api.get(`/users/${uid}/notifications`)).data,
  resolveWatchlistVideos: async (items) =>
    Promise.all(
      items.map(
        async (i) => (await api.get(`/content/videos/${i.video_id}`)).data,
      ),
    ),
};
