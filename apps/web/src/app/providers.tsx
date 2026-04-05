"use client";

import { type ReactNode } from "react";
import { setTokenStorage } from "@agriscan/shared";
import { AuthProvider } from "@/hooks/useAuth";

if (typeof window !== "undefined") {
  setTokenStorage({
    getAccessToken: () => localStorage.getItem("accessToken"),
    getRefreshToken: () => localStorage.getItem("refreshToken"),
    saveTokens: (access, refresh) => {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
    },
    clearTokens: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
