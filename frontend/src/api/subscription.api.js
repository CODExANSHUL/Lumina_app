import { api } from "./client";
export const subscriptionApi = {
  plans: async () => (await api.get("/subscriptions/plans")).data,
  active: async (uid) => (await api.get(`/subscriptions/${uid}/active`)).data,
  subscribe: async (uid, plan_id, payment_method = "UPI", auto_renew = false) =>
    (
      await api.post(`/subscriptions/${uid}`, {
        plan_id,
        payment_method,
        auto_renew,
      })
    ).data,
  renew: async (id) => (await api.put(`/subscriptions/${id}/renew`)).data,
  cancel: async (id) => (await api.delete(`/subscriptions/${id}`)).data,
  history: async (uid) => (await api.get(`/subscriptions/${uid}/history`)).data,
};
