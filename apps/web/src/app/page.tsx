"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user, isLoading, logout, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải...
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Agri-Scan AI</h1>
      {isAuthenticated && user ? (
        <>
          <p className="text-gray-700">
            Xin chào, <strong>{user.fullName || user.email}</strong> ({user.role})
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)]"
          >
            Đăng ký
          </Link>
        </div>
      )}
    </main>
  );
}
