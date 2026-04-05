"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { authApi } from "@agri-scan/shared";
import type { IUser } from "@agri-scan/shared";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string,
    fullName: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  handleOAuthSuccess: (
    accessToken: string,
    refreshToken: string,
    user: IUser,
  ) => void;
  loginWithGoogle: () => void; // ← THÊM DÒNG NÀY
  loginWithFacebook: () => void;
  setPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session từ localStorage khi app load
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      // Hiển thị user cũ từ cache trước để UI không bị trống
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      // Fetch profile mới nhất từ server
      authApi
        .getProfile()
        .then((profile) => {
          localStorage.setItem("user", JSON.stringify(profile));
          setUser(profile);
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false); // ← quan trọng, không có token vẫn phải tắt loading
    }
  }, []);

  // ── ĐĂNG NHẬP ────────────────────────────────────────────────────────────────
  // BUG FIX (lần trước): login giờ nhận đủ email + password, gọi API thật
  // BUG FIX (lần này): bỏ setTokenStorage() - providers.tsx đã gọi rồi, gọi 2 lần gây ghi đè
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── ĐĂNG KÝ ─────────────────────────────────────────────────────────────────
  // BUG FIX (lần trước): thêm password - giờ gửi đủ thông tin lên BE
  const register = useCallback(
    async (email: string, fullName: string, password: string) => {
      setIsLoading(true);
      try {
        await authApi.register({ email, fullName, password });
        // Đăng ký xong KHÔNG tự đăng nhập → user cần login thủ công
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ── REFRESH USER ─────────────────────────────────────────────────────────────
  // Gọi lại /auth/profile để đồng bộ user state sau khi nâng cấp gói
  const refreshUser = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
    } catch {
      // Nếu token hết hạn, bỏ qua — interceptor sẽ xử lý
    }
  }, []);

  const setPassword = useCallback(
    async (newPassword: string) => {
      await authApi.setPassword(newPassword);
      await refreshUser(); // Cập nhật lại isPasswordSet
    },
    [refreshUser],
  );

  // ── ĐĂNG XUẤT ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Lỗi mạng vẫn phải xóa token local
    } finally {
      // BUG FIX: providers.tsx clearTokens không xóa 'user' → đã fix bên providers.tsx
      // useAuth.tsx cũng xóa user state để đồng bộ UI ngay lập tức
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    authApi.loginWithGoogle();
  }, []);

  const loginWithFacebook = useCallback(() => {
    authApi.loginWithFacebook();
  }, []);

  // ── XỬ LÝ SAU OAUTH ──────────────────────────────────────────────────────────
  const handleOAuthSuccess = useCallback(
    (accessToken: string, refreshToken: string, userData: IUser) => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        handleOAuthSuccess,
        loginWithGoogle, // Thêm vào đây
        loginWithFacebook, // Thêm vào đây
        setPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth bắt buộc phải được bọc bên trong <AuthProvider>");
  }
  return context;
}
