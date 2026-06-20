"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { VPS } from "@/types";
import { motion } from "framer-motion";
import { Server, ArrowLeft, Check, Terminal } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function VPSDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [vps, setVps] = useState<VPS | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!currentUser || !id) return;
      const snap = await getDoc(doc(db, "vps", id));
      if (snap.exists() && snap.data().userId === currentUser.uid) {
        setVps(snap.data() as VPS);
      } else {
        router.push("/dashboard/vps");
      }
      setLoading(false);
    };
    fetch();
  }, [id, currentUser, router]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} command sent to ${vps?.hostname}`);
    setActionLoading(null);
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!vps) return null;

  const stackItems = [
    { label: "Operating System", value: "AlmaLinux 9", badge: true },
    { label: "Control Panel", value: "CyberPanel", badge: true },
    { label: "Container Runtime", value: "Docker", badge: true },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <Link href="/dashboard/vps" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My VPS
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-[14px] flex items-center justify-center">
            <Server className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vps.hostname}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{vps.planName} · {vps.ipAddress}</p>
          </div>
        </div>
        <Badge variant={vps.status === "active" ? "success" : "warning"} className="text-sm px-3 py-1">
          <span className={`w-2 h-2 rounded-full mr-2 inline-block ${vps.status === "active" ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
          {vps.status.charAt(0).toUpperCase() + vps.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Server Details */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[16px] border border-gray-100 shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Server Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Hostname", value: vps.hostname },
                { label: "IP Address", value: vps.ipAddress },
                { label: "CPU", value: vps.cpu },
                { label: "RAM", value: vps.ram },
                { label: "Storage", value: vps.storage },
                { label: "Created", value: new Date(vps.createdAt).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-[10px] px-4 py-3">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Installed Stack */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[16px] border border-gray-100 shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Pre-installed Stack</h2>
            <div className="space-y-3">
              {stackItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-5">
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Server Controls</h2>
            <div className="space-y-2">
              {[
                { label: "Start Server", key: "start", disabled: vps.status === "active", variant: "secondary" as const },
                { label: "Stop Server", key: "stop", disabled: vps.status === "stopped", variant: "ghost" as const },
                { label: "Reboot Server", key: "reboot", disabled: false, variant: "ghost" as const },
                { label: "Reinstall OS", key: "reinstall", disabled: false, variant: "danger" as const },
              ].map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant}
                  size="sm"
                  className="w-full"
                  disabled={action.disabled}
                  loading={actionLoading === action.key}
                  onClick={() => handleAction(action.key)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-gray-100 shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Console Access</h2>
            <p className="text-xs text-gray-400 mb-4">Launch the web-based console to access your server terminal.</p>
            <button
              onClick={() => toast.success("Console launching... (connect your VPS IP)")}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-[10px] hover:bg-gray-800 transition-colors"
            >
              <Terminal className="w-4 h-4" />
              Open Console
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
