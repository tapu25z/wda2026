"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthSuccess } = useAuth(); // Lấy hàm đồng bộ state từ Context
  const isProcessing = useRef(false); // Ngăn React Strict Mode chạy effect 2 lần

  useEffect(() => {
    // Nếu đang xử lý rồi thì bỏ qua
    if (isProcessing.current) return;
    isProcessing.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user"); // JSON encoded từ backend

    // ── Thiếu token → về login ────────────────────────────────
    if (!accessToken || !refreshToken) {
      console.error("Lỗi: Không tìm thấy token từ URL");
      router.replace("/login?error=missing_token");
      return;
    }

    // ── Parse user object nếu backend gửi về ─────────────────
    let userData = {} as any;
    let isPasswordSet = true;

    if (userParam) {
      try {
        userData = JSON.parse(decodeURIComponent(userParam));
        isPasswordSet = userData?.isPasswordSet !== false;
      } catch (error) {
        console.error("Lỗi parse thông tin user:", error);
        // Nếu lỗi, vẫn cứ để userData rỗng, AuthProvider sẽ gọi API getProfile để bù vào sau
      }
    }

    // ── Lưu token và cập nhật State NGAY LẬP TỨC ──────────────
    handleOAuthSuccess(accessToken, refreshToken, userData);

if (!isPasswordSet) {
      router.replace("/"); 
    } else {
      router.replace("/"); 
    }
  }, [searchParams, router, handleOAuthSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Đang đồng bộ tài khoản...</p>
        <p className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}