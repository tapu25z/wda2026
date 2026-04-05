/**
 * Header Component - Navigation header cho website
 */

"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common";
import { APP_NAME } from "@agri-scan/shared";

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-green-600">{APP_NAME}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/scan"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Chẩn đoán AI
            </Link>
            <Link
              href="/plants"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Từ điển cây trồng
            </Link>
            <Link
              href="/diseases"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Từ điển bệnh
            </Link>
            {isAuthenticated && (
              <Link
                href="/history"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Lịch sử
              </Link>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Xin chào, <strong>{user?.fullName}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
