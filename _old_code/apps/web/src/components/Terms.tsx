"use client";

import React from "react";
import {
  FileText,
  Cpu,
  AlertOctagon,
  CreditCard,
  Copyright,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="bg-primary/5 px-8 py-12 border-b border-primary/10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Điều khoản sử dụng
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chào mừng bạn đến với Agri-Scan. Bằng việc truy cập và sử dụng ứng
            dụng của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện
            dưới đây.
          </p>
          <div className="mt-6 text-sm text-gray-500 font-medium">
            Có hiệu lực từ: 20/03/2026
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                1. Dịch vụ AI & Nhận diện bệnh cây
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p>
                Agri-Scan cung cấp công cụ Trí tuệ nhân tạo để phân tích hình ảnh
                cây trồng, hỗ trợ phát hiện sâu bệnh, thiếu dinh dưỡng và các vấn
                đề thường gặp trên cây.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>
                  Kết quả phân tích được tạo ra từ mô hình AI và dữ liệu huấn luyện.
                </li>
                <li>
                  Hệ thống hỗ trợ chẩn đoán nhưng không đảm bảo chính xác tuyệt đối
                  trong mọi trường hợp.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertOctagon className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                2. Miễn trừ trách nhiệm
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p className="font-medium text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                Lưu ý: Các kết quả và đề xuất từ Agri-Scan chỉ mang tính tham khảo.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Người dùng nên kết hợp với tư vấn thực tế từ kỹ sư nông nghiệp
                  hoặc chuyên gia phù hợp.
                </li>
                <li>
                  Chúng tôi không chịu trách nhiệm cho thiệt hại phát sinh từ việc
                  áp dụng trực tiếp mọi khuyến nghị của hệ thống.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                3. Gói dịch vụ và thanh toán
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p>
                Agri-Scan có thể cung cấp các gói miễn phí và trả phí tùy theo tính
                năng của hệ thống.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Phí dịch vụ sẽ được hiển thị rõ trước khi thanh toán.</li>
                <li>
                  Một số gói có thể tự gia hạn nếu người dùng không chủ động hủy.
                </li>
                <li>
                  Chính sách hoàn tiền sẽ phụ thuộc vào từng loại gói và thông báo
                  cụ thể tại thời điểm mua.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Copyright className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                4. Quyền sở hữu trí tuệ
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p>
                Nội dung, giao diện, logo, dữ liệu và công nghệ của Agri-Scan thuộc
                quyền sở hữu của chúng tôi hoặc các bên cấp phép liên quan.
              </p>
              <p className="mt-3">
                Bạn không được sao chép, phân phối lại, chỉnh sửa hoặc khai thác
                trái phép bất kỳ phần nào của hệ thống nếu chưa được cho phép.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                5. Chấm dứt quyền sử dụng
              </h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              <p>
                Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện
                hành vi vi phạm điều khoản, lạm dụng hệ thống hoặc gây ảnh hưởng đến
                nền tảng.
              </p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cần hỗ trợ thêm?
            </h3>
            <p className="text-gray-600 mb-4">
              Nếu bạn có thắc mắc về điều khoản sử dụng, hãy liên hệ với chúng tôi.
            </p>
            <a
              href="/feedback"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Gửi phản hồi
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}