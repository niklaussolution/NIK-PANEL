"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VPS } from "@/types";
import { motion } from "framer-motion";
import { Server, Search, RefreshCw } from "lucide-react";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function AdminVPSPage() {
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchVPS = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "vps"));
      setVpsList(snap.docs.map((d) => ({ ...(d.data() as VPS), id: d.id })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVPS(); }, []);

  const updateStatus = async (id: string, status: VPS["status"]) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "vps", id), { status });
      setVpsList((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success(`VPS status updated to ${status}`);
    } catch {
      toast.error("Failed to update VPS status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = vpsList.filter((v) =>
    v.hostname?.toLowerCase().includes(search.toLowerCase()) ||
    v.ipAddress?.includes(search) ||
    v.planName?.toLowerCase().includes(search.toLowerCase())
  );

  const statusOpts: VPS["status"][] = ["active", "stopped", "suspended"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VPS Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {vpsList.filter((v) => v.status === "active").length} active · {vpsList.length} total
          </p>
        </div>
        <button onClick={fetchVPS} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-[10px] transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by hostname, IP, plan..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Server className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No VPS servers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Hostname", "IP Address", "Plan", "CPU", "RAM", "OS", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((vps) => (
                  <tr key={vps.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-orange-50 rounded-[7px] flex items-center justify-center flex-shrink-0">
                          <Server className="w-3.5 h-3.5 text-[#FF6B00]" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{vps.hostname}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-600">{vps.ipAddress}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{vps.planName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{vps.cpu}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{vps.ram}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">AlmaLinux 9</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={vps.status === "active" ? "success" : vps.status === "stopped" ? "warning" : "danger"}>
                        {vps.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={vps.status}
                        disabled={updatingId === vps.id}
                        onChange={(e) => updateStatus(vps.id, e.target.value as VPS["status"])}
                        className="text-xs border border-gray-200 rounded-[8px] px-2 py-1.5 outline-none focus:border-[#0066FF] bg-white text-gray-700 disabled:opacity-50"
                      >
                        {statusOpts.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
