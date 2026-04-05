import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Suspense } from "react";

export default function ForgotPasswordPage() {
return (
    <div className="pt-24">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-gray-400">
            Đang tải form quên mật khẩu...
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
