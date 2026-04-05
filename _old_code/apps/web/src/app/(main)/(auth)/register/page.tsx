import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";


export default function RegisterPage() {
 return (
    <div className="pt-24">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-gray-400">
            Đang tải form đăng ký...
          </div>
        }
      >
        <RegisterForm/>
      </Suspense>
    </div>
  );
}