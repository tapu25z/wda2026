import { UserProfile } from "@/components";
import { Suspense } from "react";
export default function ProfilePage() {
return (
    <div className="pt-24">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-gray-400">
            Đang tải form hồ sơ...
          </div>
        }
      >
        <UserProfile  />
      </Suspense>
    </div>
  );
}
