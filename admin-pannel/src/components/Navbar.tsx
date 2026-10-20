"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { triggerSyncBroadcast, resetSyncSuccess } from "@/store/slices/attendanceSlice";
import { LogOut, Radio, Loader2, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { syncing, syncSuccess } = useAppSelector((state) => state.attendance);

  useEffect(() => {
    if (syncSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetSyncSuccess());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [syncSuccess, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handleTriggerSync = () => {
    dispatch(triggerSyncBroadcast());
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between text-slate-200">
      <h2 className="font-semibold text-lg text-white">{title}</h2>

      <div className="flex items-center gap-4">
        {user?.role === "company_admin" && (
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              syncSuccess
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30 hover:text-white"
            }`}
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : syncSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
            )}
            {syncing
              ? "Broadcasting..."
              : syncSuccess
              ? "Sync Signal Emitted!"
              : "Sync Tablet Terminals"}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}
