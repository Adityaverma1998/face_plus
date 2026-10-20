"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompanies,
  createCompany,
  createTerminal,
  Company,
} from "@/store/slices/companiesSlice";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  Building2,
  Users,
  Plus,
  Tablet,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  X,
} from "lucide-react";

export default function CompaniesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { companies, loading, creating } = useAppSelector(
    (state) => state.companies
  );

  const [search, setSearch] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // New Company Form
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  // New Terminal Form
  const [terminalUser, setTerminalUser] = useState("");
  const [terminalPass, setTerminalPass] = useState("");
  const [submittingTerminal, setSubmittingTerminal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "super_admin") {
      router.replace("/login");
      return;
    }
    dispatch(fetchCompanies());
  }, [isAuthenticated, user, router, dispatch]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      createCompany({
        company_code: newCode.trim().toUpperCase(),
        company_name: newName.trim(),
        admin_username: newAdminUser.trim(),
        admin_password: newAdminPass,
      })
    );

    if (createCompany.fulfilled.match(result)) {
      setShowCreateModal(false);
      setNewCode("");
      setNewName("");
      setNewAdminUser("");
      setNewAdminPass("");
    } else {
      alert((result.payload as string) || "Failed to create company");
    }
  };

  const handleCreateTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setSubmittingTerminal(true);

    const result = await dispatch(
      createTerminal({
        companyId: selectedCompany.id,
        username: terminalUser.trim(),
        password: terminalPass,
      })
    );

    setSubmittingTerminal(false);
    if (createTerminal.fulfilled.match(result)) {
      alert(`Terminal credentials created for ${selectedCompany.company_name}!`);
      setShowTerminalModal(false);
      setTerminalUser("");
      setTerminalPass("");
    } else {
      alert((result.payload as string) || "Failed to create terminal");
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.company_code.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmployees = companies.reduce(
    (acc, curr) => acc + (curr.employee_count || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Tenant Companies Management" />

        <main className="p-8 space-y-6 flex-1 overflow-auto">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {companies.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Tenants
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {companies.filter((c) => c.is_active).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Employees Synced
                </p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  {totalEmployees}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Header & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Create Company
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Company Code</th>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Employees</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading tenants via Redux...
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No companies found. Click &quot;Create Company&quot; to onboard your first tenant.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-400">
                          {c.company_code}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {c.company_name}
                        </td>
                        <td className="px-6 py-4">{c.employee_count}</td>
                        <td className="px-6 py-4">
                          {c.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setShowTerminalModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                          >
                            <Tablet className="w-3.5 h-3.5 text-cyan-400" />
                            Add Terminal
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Onboard New Tenant Company
            </h3>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Code (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TESLA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tesla Motors Inc"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-indigo-400 mb-2">
                  Initial Company Admin Account
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                      placeholder="e.g. tesla_admin"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Company & Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Terminal Provision Modal */}
      {showTerminalModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTerminalModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Tablet className="w-5 h-5 text-cyan-400" />
              Add Terminal Device
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Provision tablet credentials for{" "}
              <strong className="text-white">{selectedCompany.company_name}</strong>
            </p>
            <form onSubmit={handleCreateTerminal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Terminal Identifier / Username
                </label>
                <input
                  type="text"
                  required
                  value={terminalUser}
                  onChange={(e) => setTerminalUser(e.target.value)}
                  placeholder="e.g. tablet_front_gate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Terminal Device Password
                </label>
                <input
                  type="password"
                  required
                  value={terminalPass}
                  onChange={(e) => setTerminalPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={submittingTerminal}
                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {submittingTerminal && <Loader2 className="w-4 h-4 animate-spin" />}
                Provision Tablet Terminal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
