"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAttendance } from "@/store/slices/attendanceSlice";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  CalendarCheck2,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  Loader2,
  Tablet,
  CheckCircle2,
} from "lucide-react";

export default function AttendancePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { records, loading } = useAppSelector((state) => state.attendance);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "company_admin") {
      router.replace("/login");
      return;
    }
    dispatch(fetchAttendance());
  }, [isAuthenticated, user, router, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAttendance());
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.employees?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.employees?.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
      r.device_id?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === "all" || r.event_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const checkIns = records.filter((r) => r.event_type === "check_in").length;
  const checkOuts = records.filter((r) => r.event_type === "check_out").length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Synced Attendance Logs" />

        <main className="p-8 space-y-6 flex-1 overflow-auto">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Synced Punches
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {records.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Check-ins
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {checkIns}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LogIn className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Check-outs
                </p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {checkOuts}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <LogOut className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filters & Refresh */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee or device..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Events</option>
                <option value="check_in">Check-in Only</option>
                <option value="check_out">Check-out Only</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Logs
            </button>
          </div>

          {/* Attendance Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Punch Time</th>
                    <th className="px-6 py-4">Face Confidence</th>
                    <th className="px-6 py-4">Terminal Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Fetching synced attendance logs via Redux...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No synced attendance records found yet. Punches from mobile tablets will appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => {
                      const isCheckIn = r.event_type === "check_in";
                      const dateObj = new Date(r.punch_time);
                      const formattedTime = dateObj.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });
                      const formattedDate = dateObj.toLocaleDateString();

                      return (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">
                              {r.employees?.display_name || "Employee"}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {r.employees?.employee_code || r.employee_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {r.employees?.department || "-"}
                          </td>
                          <td className="px-6 py-4">
                            {isCheckIn ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <LogIn className="w-3 h-3" /> Check In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <LogOut className="w-3 h-3" /> Check Out
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium text-xs">
                              {formattedTime}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {formattedDate}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {r.match_score ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-400">
                                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                                {(r.match_score * 100).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600 font-mono">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                              <Tablet className="w-3.5 h-3.5 text-slate-500" />
                              {r.device_id || "default_terminal"}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
