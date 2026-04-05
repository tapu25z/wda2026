'use client';

/**
 * Providers - Nơi tiêm cấu hình và bọc Context cho toàn bộ App Web
 * 
 * setTokenStorage() được gọi DUY NHẤT ở đây.
 * useAuth.tsx KHÔNG được gọi lại - tránh ghi đè instance.
 */

import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { setTokenStorage } from "@agri-scan/shared";

// Chỉ chạy phía trình duyệt (tránh crash khi Next.js SSR)
if (typeof window !== 'undefined') {
  setTokenStorage({
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    saveTokens: (access: string, refresh: string) => {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
    },
    // BUG FIX: bản cũ thiếu xóa 'user' → sau logout, localStorage vẫn còn
    // dữ liệu user cũ → khi refresh trang user vẫn thấy mình đang đăng nhập
    clearTokens: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user'); // ← thêm dòng này
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
