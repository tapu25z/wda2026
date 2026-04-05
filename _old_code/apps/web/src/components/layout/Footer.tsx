import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Globe,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#064E3B] text-emerald-100 py-12 mt-auto font-sans text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About & App */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
                Tải ứng dụng Agri-Scan
              </h3>
              <div className="flex flex-col gap-2">
                <button className="flex items-center bg-emerald-800 border border-emerald-700 text-white px-3 py-2 rounded hover:bg-emerald-700 transition-colors w-fit">
                  <Smartphone size={16} className="mr-2" />
                  <div className="text-left">
                    <div className="text-[8px] uppercase text-emerald-200">
                      Download on the
                    </div>
                    <div className="text-xs font-bold leading-none">
                      App Store
                    </div>
                  </div>
                </button>
                <button className="flex items-center bg-emerald-800 border border-emerald-700 text-white px-3 py-2 rounded hover:bg-emerald-700 transition-colors w-fit">
                  <Globe size={16} className="mr-2" />
                  <div className="text-left">
                    <div className="text-[8px] uppercase text-emerald-200">
                      Get it on
                    </div>
                    <div className="text-xs font-bold leading-none">
                      Google Play
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
                Kết nối
              </h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="text-emerald-300 hover:text-white transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="text-emerald-300 hover:text-white transition-colors"
                >
                  <Youtube size={20} />
                </a>
                <a
                  href="#"
                  className="text-emerald-300 hover:text-white transition-colors font-bold"
                >
                  Zalo
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
              Tổng đài hỗ trợ
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-emerald-300 mb-0.5">
                  Tư vấn kỹ thuật (Miễn phí)
                </p>
                <a
                  href="tel:18006601"
                  className="text-lg font-bold text-white hover:text-emerald-200 block"
                >
                  1800 6601
                </a>
              </div>
              <div>
                <p className="text-xs text-emerald-300 mb-0.5">
                  Hỗ trợ tài khoản (8h-22h)
                </p>
                <a
                  href="tel:18006602"
                  className="text-lg font-bold text-white hover:text-emerald-200 block"
                >
                  1800 6602
                </a>
              </div>
              <div>
                <p className="text-xs text-emerald-300 mb-0.5">Email</p>
                <a
                  href="mailto:hotro@agriscan.ai"
                  className="text-emerald-100 hover:text-white flex items-center"
                >
                  hotro@agriscan.ai
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
              Chính sách
            </h3>
            <ul className="space-y-2 text-emerald-200">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hướng dẫn chẩn đoán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Gửi góp ý & Khiếu nại
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Address & Certs */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">
              Địa chỉ
            </h3>
            <div className="space-y-4 text-emerald-200">
              <p className="flex items-start text-xs leading-relaxed">
                <MapPin size={14} className="mr-2 mt-0.5 shrink-0" />
                <span>
                  Lô E2a-7, Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP.
                  Thủ Đức, TP. Hồ Chí Minh
                </span>
              </p>

              <div className="pt-4 border-t border-emerald-800">
                <div className="flex gap-2 mb-3">
                  <div className="bg-white p-1 rounded h-8 w-auto flex items-center">
                    <ShieldCheck className="text-emerald-600 mr-1" size={12} />
                    <span className="text-[8px] font-bold text-emerald-800 leading-tight">
                      BỘ CÔNG THƯƠNG
                    </span>
                  </div>
                  <div className="bg-white p-1 rounded h-8 w-auto flex items-center">
                    <span className="text-[8px] font-bold text-blue-800 leading-tight px-1">
                      DMCA
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-90 hover:opacity-100 transition-all">
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[6px] font-bold text-blue-800">
                    VISA
                  </div>
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[6px] font-bold text-red-600">
                    MC
                  </div>
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-[6px] font-bold text-pink-600">
                    Momo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-emerald-800 pt-6 text-center text-xs text-emerald-400">
          <p className="mb-1">
            © 2026 Công Ty Cổ Phần Công Nghệ Nông Nghiệp Agri-Scan AI.
          </p>
          <p>Website & AI Innovation Contest 2026 - Foundation Track</p>
        </div>
      </div>
    </footer>
  );
}
