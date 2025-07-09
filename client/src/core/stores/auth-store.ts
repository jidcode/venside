import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "../schema/types";

export interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (profile: UserProfile) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (profile: UserProfile) =>
        set({ user: profile, isAuthenticated: true }),

      updateUser: (updates: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      clearAuth: () => {
        set({ user: null, isAuthenticated: false }),
          localStorage.removeItem("auth-state");
      },
    }),
    {
      name: "auth-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
