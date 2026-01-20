import { create } from "zustand";
import { UserJwtClaims } from "@/lib/auth/types";

type SessionState = {
    user: UserJwtClaims | null;
    isAuthenticated: boolean;
    setSession: (claims: UserJwtClaims) => void;
    clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
    user: null,
    isAuthenticated: false,

    setSession: (claims) =>
        set({
            user: claims,
            isAuthenticated: true,
        }),

    clearSession: () =>
        set({
            user: null,
            isAuthenticated: false,
        }),
}));
