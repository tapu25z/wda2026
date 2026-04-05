import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { formatDate, pageVariants } from "./utils";
import { adminApi } from "@agri-scan/shared"; // Kiểm tra lại đường dẫn này
import { IUser, SubscriptionPlan, UserRole } from "@agri-scan/shared";

export default function UsersTab() {
  // --- States ---
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "ALL">("ALL");

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers({
        page: currentPage,
        limit: limit,
        search: searchUser || undefined,
        plan: planFilter === "ALL" ? undefined : (planFilter as any),
      });

      const rawData = response.data || [];

      const formattedUsers: IUser[] = rawData.map((u: any) => ({
        ...u,
        id: u._id, // Map _id sang id

        // FIX LỖI: Bổ sung các trường TypeScript yêu cầu nhưng API không có
        avatar: (u as any).avatar || null, // Nếu API không có avatar, để là null
        provider:
          u.authProviders && u.authProviders.length > 0
            ? (u.authProviders[0] as any)
            : "LOCAL", // Lấy provider đầu tiên hoặc mặc định là LOCAL

        // Các trường logic cho UI
        isGoogleLinked: u.authProviders?.includes("google") || false,
        isFacebookLinked: u.authProviders?.includes("facebook") || false,
        planExpiresAt: u.planExpiresAt ? new Date(u.planExpiresAt) : null,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
        lastResetDate: (u as any).lastResetDate
          ? new Date((u as any).lastResetDate)
          : new Date(),
      }));

      setUsers(formattedUsers);
      setTotalUsers(response.pagination.total);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchUser, planFilter]);

  // Gọi API khi thay đổi page/filter (có debounce cho search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // --- Thao tác cập nhật ---
  const handleUpdatePlan = async (
    userId: string,
    newPlan: SubscriptionPlan,
  ) => {
    // 1. Log để kiểm tra giá trị đầu vào
    console.log("--- Bắt đầu cập nhật ---");
    console.log("UserId gửi đi:", userId);
    console.log("Gói mới chọn:", newPlan);

    if (!userId) {
      alert("Lỗi: ID người dùng không hợp lệ (undefined)!");
      return;
    }

    try {
      // 2. Gọi API thực tế
      // Ép kiểu 'as any' cho newPlan nếu TypeScript báo lỗi Enum vs String
      const response = await adminApi.updateUserPlan(userId, newPlan as any);

      console.log("Phản hồi từ Server:", response);

      // 3. Cập nhật State cục bộ (Chỉ chạy khi API thành công)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u)),
      );

      // 4. (Tùy chọn) Có thể dùng Toast thay vì alert cho chuyên nghiệp
      // toast.success("Cập nhật gói thành công!");
    } catch (error: any) {
      // 5. LOG CHI TIẾT LỖI - Đây là phần quan trọng nhất để biết tại sao fail
      const errorMsg = error.response?.data?.message || error.message;
      console.error("Lỗi cập nhật chi tiết:", error.response?.data);

      alert(`Lỗi: ${errorMsg}`);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Quản lý người dùng
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm email, tên..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
              value={searchUser}
              onChange={(e) => {
                setSearchUser(e.target.value);
                setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
              }}
            />
          </div>
          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm font-medium text-slate-700"
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value as SubscriptionPlan | "ALL");
              setCurrentPage(1); // Reset về trang 1 khi lọc
            }}
          >
            <option value="ALL">Tất cả gói</option>
            <option value={SubscriptionPlan.FREE}>FREE</option>
            <option value={SubscriptionPlan.PREMIUM}>PREMIUM</option>
            <option value={SubscriptionPlan.VIP}>VIP</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gói hiện tại
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Lượt dùng
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {(user as any).avatar ? (
                          <img
                            src={(user as any).avatar}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {user.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {user.email}
                            <div className="flex gap-1">
                              {user.isGoogleLinked && (
                                <span
                                  className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold"
                                  title="Google Linked"
                                >
                                  G
                                </span>
                              )}
                              {user.isFacebookLinked && (
                                <span
                                  className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold"
                                  title="Facebook Linked"
                                >
                                  F
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          user.role === UserRole.ADMIN
                            ? "bg-purple-100 text-purple-700"
                            : user.role === UserRole.EXPERT
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                            user.plan === SubscriptionPlan.VIP
                              ? "bg-amber-100 text-amber-700"
                              : user.plan === SubscriptionPlan.PREMIUM
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.plan}
                        </span>
                        {user.plan !== SubscriptionPlan.FREE &&
                          user.planExpiresAt && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              HSD:{" "}
                              {new Date(user.planExpiresAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-emerald-500" />
                          <span>{user.dailyImageCount} ảnh</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={14} className="text-blue-500" />
                          <span>{user.dailyPromptCount} chat</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        className="text-sm font-medium border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:border-emerald-400 transition-colors cursor-pointer"
                        value={user.plan}
                        onChange={(e) =>
                          handleUpdatePlan(
                            user.id,
                            e.target.value as SubscriptionPlan,
                          )
                        }
                      >
                        <option value={SubscriptionPlan.FREE}>
                          Hạ về FREE
                        </option>
                        <option value={SubscriptionPlan.PREMIUM}>
                          Nâng PREMIUM
                        </option>
                        <option value={SubscriptionPlan.VIP}>Nâng VIP</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {!isLoading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search size={40} className="text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600">
                        Không tìm thấy người dùng
                      </p>
                      <p className="text-sm text-slate-400">
                        Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <span className="text-sm font-medium text-slate-500">
            Hiển thị{" "}
            <span className="text-slate-900 font-bold">{users.length}</span> /{" "}
            {totalUsers} người dùng
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center px-3 text-sm font-bold text-slate-700">
              Trang {currentPage}
            </div>
            <button
              disabled={
                users.length < limit ||
                currentPage * limit >= totalUsers ||
                isLoading
              }
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
