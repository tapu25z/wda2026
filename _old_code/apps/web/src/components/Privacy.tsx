"use client";

import React from "react";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="bg-primary/5 px-8 py-12 border-b border-primary/10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Chính sách bảo mật
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agri-Scan cam kết bảo vệ thông tin cá nhân và dữ liệu người dùng trong
            quá trình sử dụng hệ thống.
          </p>
          <div className="mt-6 text-sm text-gray-500 font-medium">
            Cập nhật lần cuối: 20/03/2026
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                1. Thông tin được thu thập
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>Thông tin tài khoản như họ tên, email, mật khẩu đã mã hóa.</li>
                <li>Dữ liệu hình ảnh cây trồng do người dùng tải lên.</li>
                <li>Lịch sử quét, tương tác và thông tin sử dụng hệ thống.</li>
                <li>Thông tin thiết bị và trình duyệt để tối ưu trải nghiệm.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                2. Mục đích sử dụng dữ liệu
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>Phân tích và trả kết quả chẩn đoán bệnh cây.</li>
                <li>Cải thiện chất lượng hệ thống và mô hình AI.</li>
                <li>Hỗ trợ chăm sóc khách hàng và xử lý phản hồi.</li>
                <li>Cung cấp các tính năng, cảnh báo và cập nhật liên quan.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                3. Bảo mật dữ liệu
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p>
                Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp nhằm
                bảo vệ dữ liệu khỏi truy cập trái phép, thất thoát hoặc lạm dụng.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                4. Quyền của người dùng
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>Xem và cập nhật thông tin cá nhân.</li>
                <li>Yêu cầu xóa dữ liệu hoặc tài khoản khi cần thiết.</li>
                <li>Từ chối một số hình thức thông báo không bắt buộc.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                5. Chia sẻ dữ liệu
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p>
                Chúng tôi không bán dữ liệu cá nhân của người dùng. Dữ liệu chỉ có
                thể được chia sẻ với các đối tác vận hành cần thiết hoặc khi có yêu
                cầu hợp pháp từ cơ quan có thẩm quyền.
              </p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Có câu hỏi về quyền riêng tư?
            </h3>
            <p className="text-gray-600 mb-4">
              Hãy liên hệ với chúng tôi nếu bạn cần giải đáp thêm.
            </p>
            <a
              href="/feedback"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}