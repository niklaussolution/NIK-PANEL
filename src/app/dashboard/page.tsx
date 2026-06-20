"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, DollarSign, LifeBuoy, ShieldCheck, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Order, VPS, Ticket } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  sub?: string;
}

export default function DashboardPage() {
  const { currentUser, userData } = useAuth();
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      try {
        const [vpsSnap, ticketsSnap] = await Promise.all([
          getDocs(query(collection(db, "vps"), where("userId", "==", currentUser.uid))),
          getDocs(query(collection(db, "tickets"), where("userId", "==", currentUser.uid))),
        ]);
        setVpsList(vpsSnap.docs.map((d) => d.data() as VPS));
        setTickets(ticketsSnap.docs.map((d) => d.data() as Ticket));

        // orders needs a composite index — fall back to unordered while index is building
        try {
          const ordersSnap = await getDocs(
            query(collection(db, "orders"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(5))
          );
          setOrders(ordersSnap.docs.map((d) => d.data() as Order));
        } catch {
          const ordersSnap = await getDocs(
            query(collection(db, "orders"), where("userId", "==", currentUser.uid), limit(5))
          );
          setOrders(ordersSnap.docs.map((d) => d.data() as Order));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const activeVPS = vpsList.filter((v) => v.status === "active").length;
  const monthlyCost = vpsList.reduce((sum, v) => {
    const priceMap: Record<string, number> = { starter: 499, business: 999, professional: 1999, enterprise: 3999 };
    return sum + (priceMap[v.planId] || 0);
  }, 0);
  const pendingTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  const stats: StatCard[] = [
    { label: "Active VPS", value: activeVPS, icon: Server, color: "text-[#FF6B00]", bg: "bg-orange-50", sub: `${vpsList.length} total` },
    { label: "Monthly Cost", value: `₹${monthlyCost}`, icon: DollarSign, color: "text-[#0066FF]", bg: "bg-blue-50", sub: "Current billing" },
    { label: "Pending Tickets", value: pendingTickets, icon: LifeBuoy, color: "text-purple-600", bg: "bg-purple-50", sub: `${tickets.length} total` },
    { label: "Account Status", value: "Active", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", sub: "In good standing" },
  ];

  const name = userData?.name || currentUser?.displayName || "there";

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          Welcome back, {name.split(" ")[0]} 👋
        </motion.h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your hosting account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-[16px] border border-gray-100 shadow-card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
              </div>
              <div className={`w-10 h-10 ${stat.bg} rounded-[10px] flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VPS List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-white rounded-[16px] border border-gray-100 shadow-card"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Your VPS Servers</h2>
            <Link href="/dashboard/vps" className="text-xs text-[#FF6B00] font-medium hover:text-[#E56000] flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingData ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : vpsList.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-[12px] flex items-center justify-center mx-auto mb-3">
                <Server className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">No VPS servers yet</p>
              <p className="text-xs text-gray-400 mb-4">Get started by deploying your first VPS.</p>
              <Link href="/plans">
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Deploy VPS
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {vpsList.slice(0, 4).map((vps) => (
                <Link key={vps.id} href={`/dashboard/vps/${vps.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-orange-50 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <Server className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{vps.hostname}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{vps.ipAddress} · {vps.planName}</p>
                  </div>
                  <Badge variant={vps.status === "active" ? "success" : vps.status === "stopped" ? "warning" : "neutral"}>
                    {vps.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/dashboard/billing" className="text-xs text-[#FF6B00] font-medium hover:text-[#E56000] flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingData ? (
            <div className="p-6 flex justify-center">
              <div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{order.planName}</p>
                    <Badge variant={order.status === "paid" ? "success" : order.status === "failed" ? "danger" : "warning"}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs font-semibold text-gray-700">₹{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
