"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { VPS } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function MyVPSPage() {
  const { currentUser } = useAuth();
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVPS = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "vps"), where("userId", "==", currentUser.uid))
      );
      setVpsList(snap.docs.map((d) => d.data() as VPS));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVPS(); }, [currentUser]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My VPS</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your virtual private servers.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchVPS} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-[10px] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/plans">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New VPS
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vpsList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[20px] border border-gray-100 shadow-card p-16 text-center"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-[16px] flex items-center justify-center mx-auto mb-4">
            <Server className="w-8 h-8 text-gray-200" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No VPS servers yet</h2>
          <p className="text-gray-500 text-sm mb-6">Deploy your first VPS to get started. All plans include AlmaLinux 9, CyberPanel, and Docker.</p>
          <Link href="/plans">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Deploy Your First VPS
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {vpsList.map((vps, i) => (
            <VPSCard key={vps.id} vps={vps} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function VPSCard({ vps, index }: { vps: VPS; index: number }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    await new Promise((r) => setTimeout(r, 1500));
    setActionLoading(null);
  };

  const actions = [
    { label: "Start", key: "start", disabled: vps.status === "active" },
    { label: "Stop", key: "stop", disabled: vps.status === "stopped" },
    { label: "Reboot", key: "reboot", disabled: false },
    { label: "Reinstall", key: "reinstall", disabled: false },
    { label: "Console", key: "console", disabled: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-[10px] flex items-center justify-center">
            <Server className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{vps.hostname}</p>
            <p className="text-xs text-gray-400">{vps.planName}</p>
          </div>
        </div>
        <Badge variant={vps.status === "active" ? "success" : vps.status === "stopped" ? "warning" : vps.status === "provisioning" ? "info" : "neutral"}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${vps.status === "active" ? "bg-green-500" : vps.status === "stopped" ? "bg-yellow-500" : "bg-blue-500"}`} />
          {vps.status}
        </Badge>
      </div>

      {/* Specs */}
      <div className="px-6 py-4 grid grid-cols-2 gap-3">
        {[
          { label: "IP Address", value: vps.ipAddress },
          { label: "Operating System", value: vps.os },
          { label: "CPU", value: vps.cpu },
          { label: "RAM", value: vps.ram },
          { label: "Storage", value: vps.storage },
          { label: "CyberPanel", value: "Installed" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-50 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => !action.disabled && handleAction(action.key)}
            disabled={action.disabled || actionLoading === action.key}
            className={`px-3 py-1.5 text-xs font-medium rounded-[8px] border transition-all ${
              action.disabled
                ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                : action.key === "reinstall"
                ? "border-red-200 text-red-600 hover:bg-red-50 bg-white"
                : action.key === "console"
                ? "border-[#FF6B00] text-[#FF6B00] hover:bg-orange-50 bg-white"
                : "border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
            }`}
          >
            {actionLoading === action.key ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {action.label}
              </span>
            ) : action.label}
          </button>
        ))}
        <Link href={`/dashboard/vps/${vps.id}`} className="ml-auto text-xs font-medium text-[#0066FF] hover:text-[#0052CC] flex items-center gap-1">
          Details →
        </Link>
      </div>
    </motion.div>
  );
}
