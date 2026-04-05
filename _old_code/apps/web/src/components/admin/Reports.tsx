"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  TrendingUp,
  CreditCard,
  Zap,
  Activity,
  DollarSign,
  PieChart as PieChartIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency, formatDate, pageVariants } from "./utils";
import { MOCK_REVENUE_DATA, MOCK_USAGE_DATA } from "./mockData";
import { adminApi } from "@agri-scan/shared";
import type { IDashboard } from "@agri-scan/shared";

export default function ReportsTab() {
  const [dashboardData, setDashboardData] = useState<IDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await adminApi.getDashboard();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Load reports dashboard failed:", err);
        setError(
          err?.response?.data?.message || "Không tải được dữ liệu báo cáo."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const pieData = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        name: "Gói FREE",
        value: dashboardData.users.byPlan.FREE,
        color: "#cbd5e1",
      },
      {
        name: "Gói PREMIUM",
        value: dashboardData.users.byPlan.PREMIUM,
        color: "#3b82f6",
      },
      {
        name: "Gói VIP",
        value: dashboardData.users.byPlan.VIP,
        color: "#f59e0b",
      },
    ];
  }, [dashboardData]);

  const avgRevenuePerUser =
    dashboardData && dashboardData.users.total > 0
      ? dashboardData.revenue.total / dashboardData.users.total
      : 0;

  const paidUsers =
    dashboardData
      ? dashboardData.users.byPlan.PREMIUM + dashboardData.users.byPlan.VIP
      : 0;

  const conversionRate =
    dashboardData && dashboardData.users.total > 0
      ? (paidUsers / dashboardData.users.total) * 100
      : 0;

  const avgDailyUsage =
    MOCK_USAGE_DATA.length > 0
      ? Math.round(
          MOCK_USAGE_DATA.reduce(
            (sum, item) => sum + item.images + item.prompts,
            0
          ) / MOCK_USAGE_DATA.length
        )
      : 0;

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
        <Loader2 size={28} className="mx-auto text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-600 font-medium">Đang tải báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 flex items-start gap-2">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="p-6">Không có dữ liệu báo cáo.</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê</h2>
        <div className="flex gap-3">
          <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm font-medium text-slate-700">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Năm nay</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20 text-sm font-bold">
            <Download size={16} />
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Doanh thu trung bình / User
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {formatCurrency(avgRevenuePerUser)}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">
            Tổng doanh thu: {formatCurrency(dashboardData.revenue.total)}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Tỷ lệ chuyển đổi (Free {">"} Paid)
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {conversionRate.toFixed(1)}%
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Zap size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4 flex items-center gap-1">
            <TrendingUp size={14} /> {paidUsers.toLocaleString()} người dùng trả phí
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Lượt dùng trung bình
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {avgDailyUsage.toLocaleString()}{" "}
                <span className="text-sm font-medium text-slate-500">
                  lượt/ngày
                </span>
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-4">
            Dựa trên dữ liệu mock usage hiện tại
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-600" />
            Doanh thu theo gói
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_REVENUE_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(val) => `${val / 1000000}M`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
                  labelFormatter={(label) => formatDate(String(label))}
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar
                  dataKey="PREMIUM"
                  stackId="a"
                  fill="#3b82f6"
                  name="Gói PREMIUM"
                  radius={[0, 0, 4, 4]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="VIP"
                  stackId="a"
                  fill="#f59e0b"
                  name="Gói VIP"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChartIcon size={20} className="text-blue-600" />
            Phân bổ người dùng
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium text-slate-600">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {entry.value} (
                  {dashboardData.users.total
                    ? ((entry.value / dashboardData.users.total) * 100).toFixed(1)
                    : "0.0"}
                  %)
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 lg:col-span-3"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-purple-600" />
            Tần suất sử dụng hệ thống (Lượt quét & Chat)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MOCK_USAGE_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrompts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="images"
                  name="Lượt quét ảnh"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorImages)"
                />
                <Area
                  type="monotone"
                  dataKey="prompts"
                  name="Lượt chat AI"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrompts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}