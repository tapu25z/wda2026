import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="pt-24">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-gray-400">
            Đang tải form đăng nhập...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}