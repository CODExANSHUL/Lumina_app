import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      activeProfile: null,
      setSession: (user) => set({ user }),
      setActiveProfile: (activeProfile) => set({ activeProfile }),
      logout: () => set({ user: null, activeProfile: null }),
    }),
    { name: "lumina-session" },
  ),
);
