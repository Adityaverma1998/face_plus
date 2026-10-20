"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
    } else if (user.role === "super_admin") {
      router.replace("/superadmin/companies");
    } else {
      router.replace("/dashboard/attendance");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
      Loading FacePulse...
    </div>
  );
}
