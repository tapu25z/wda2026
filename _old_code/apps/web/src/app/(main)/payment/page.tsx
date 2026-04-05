import { Suspense } from "react";
import { Payment } from "@/components/Payment";

export default function PaymentPage() {
  return (
    <div className="pt-24">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-gray-400">
            Đang tải...
          </div>
        }
      >
        <Payment />
      </Suspense>
    </div>
  );
}
