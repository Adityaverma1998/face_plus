"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  Building2,
  Users,
  CalendarCheck2,
  ShieldCheck,
  Radio,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = user?.role === "super_admin";

  const superAdminLinks = [
    {
      name: "Companies (Tenants)",
      href: "/superadmin/companies",
      icon: Building2,
    },
  ];

  const companyAdminLinks = [
    {
      name: "Attendance Punches",
      href: "/dashboard/attendance",
      icon: CalendarCheck2,
    },
    {
      name: "Employee Master",
      href: "/dashboard/employees",
      icon: Users,
    },
  ];

  const links = isSuperAdmin ? superAdminLinks : companyAdminLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-lg">
            FP
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              FacePulse
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {isSuperAdmin ? "Super" : "Tenant"}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Attendance Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {user?.username || "Admin"}
            </p>
            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
              {isSuperAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Super Admin
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3 text-cyan-400" />
                  Company Admin
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
