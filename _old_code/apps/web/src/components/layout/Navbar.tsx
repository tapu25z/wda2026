"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Leaf,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Zap,
  ScanSearch,
  BookOpen,
  CloudSun,
  Settings,
  Store,
  Package,
  MessageSquare,
} from "lucide-react";
import { cn } from "@agri-scan/shared";
import { useAuth } from "../../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/about" },
    { name: "Cộng đồng", path: "/community" },
    { name: "Khu vườn", path: "/my-garden" },
  ];

  const toolItems = [
    {
      name: "Chẩn đoán AI",
      path: "/scan",
      icon: ScanSearch,
      desc: "Nhận diện bệnh cây trồng",
    },
    {
      name: "Từ điển cây",
      path: "/encyclopedia",
      icon: BookOpen,
      desc: "Tra cứu thông tin cây",
    },
    {
      name: "Thời tiết",
      path: "/weather",
      icon: CloudSun,
      desc: "Dự báo nông nghiệp",
    },
    { name: "Cửa hàng", path: "/shop", icon: Store, desc: "Mua sắm sản phẩm" },
  ];

  const isToolActive = toolItems.some((item) => pathname.startsWith(item.path));

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      )
        setIsUserMenuOpen(false);
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      )
        setIsToolsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsToolsOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-gray-200/60 border-b border-gray-100"
          : "bg-white/80 backdrop-blur-sm border-b border-gray-100/60",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-6">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none tracking-tight">
                Agri-Scan AI
              </h1>
              <span className="text-[10px] text-primary font-semibold tracking-widest uppercase">
                Bác sĩ cây trồng
              </span>
            </div>
          </Link>

          {/* Cụm Navigation Giữa */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "relative flex items-center h-10 px-4 rounded-xl text-sm font-bold transition-all duration-200",
                  isActive(item.path)
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50",
                )}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}

            {/* Dropdown Tiện ích */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={cn(
                  "relative flex items-center h-10 px-4 rounded-xl text-sm font-bold transition-all duration-200 gap-1.5",
                  isToolActive || isToolsOpen
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50",
                )}
              >
                Tiện ích
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-300",
                    isToolsOpen && "rotate-180",
                  )}
                />
                {isToolActive && !isToolsOpen && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>

              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50"
                  >
                    <div className="flex flex-col gap-1">
                      {toolItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.path}
                          className={cn(
                            "flex items-center gap-3.5 p-3 rounded-xl transition-all",
                            pathname === item.path
                              ? "bg-primary/5"
                              : "hover:bg-gray-50",
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              pathname === item.path
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            <item.icon size={20} />
                          </div>
                          <div className="text-left">
                            <div
                              className={cn(
                                "text-sm font-bold",
                                pathname === item.path
                                  ? "text-primary"
                                  : "text-gray-900",
                              )}
                            >
                              {item.name}
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Cụm Actions Bên Phải - ĐÃ KHÔI PHỤC ĐẦY ĐỦ */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/scan"
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200",
                isActive("/scan")
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/30",
              )}
            >
              <Zap size={15} />
              Chẩn đoán AI
            </Link>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-primary border-2 shadow-sm"
                    style={{
                      borderColor:
                        user.plan === "VIP"
                          ? "#fbbf24"
                          : user.plan === "PREMIUM"
                            ? "#a855f7"
                            : "transparent",
                      backgroundColor:
                        user.plan === "VIP"
                          ? "#fffbeb"
                          : user.plan === "PREMIUM"
                            ? "#faf5ff"
                            : "rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    <User size={15} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 max-w-30 truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown
                    size={13}
                    className={cn(
                      "text-gray-400 transition-transform duration-200",
                      isUserMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Dropdown Người Dùng Desktop */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate font-medium">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <User size={16} className="text-gray-400"/> Hồ sơ của tôi
                      </Link>
                      <Link
                        href="/shop/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <Package size={16} className="text-gray-400"/> Đơn hàng của tôi
                      </Link>
                      <Link
                        href="/feedback"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <MessageSquare size={20} className="text-gray-400" />
                        Góp ý & Phản hồi
                      </Link>
                      <div className="border-t border-gray-50 mt-1.5 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={16} /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/25"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - ĐÃ KHÔI PHỤC PHẦN NGƯỜI DÙNG */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-gray-700",
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <div className="my-2 border-t border-gray-50 pt-3">
                <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Tiện ích
                </p>
                {toolItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                      pathname === item.path
                        ? "text-primary bg-primary/5 font-bold"
                        : "text-gray-600",
                    )}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Phần người dùng trên Mobile */}
              <div className="mt-2 pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate font-medium">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50"
                    >
                      <User size={18} /> Hồ sơ của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3 bg-primary text-white rounded-xl font-bold text-center text-sm shadow-md"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
