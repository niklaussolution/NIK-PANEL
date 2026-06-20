"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign, Server, ArrowUpRight, Tag, Copy, Check, Percent } from "lucide-react";
import { Order } from "@/types";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  href: string;
}

interface CouponEntry {
  planId: string;
  planName: string;
  price: number;
  couponCode: string;
  couponDiscount: number;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
    >
      {ok ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]             = useState({ users: 0, orders: 0, revenue: 0, activeVPS: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [coupons, setCoupons]         = useState<CouponEntry[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersSnap, ordersSnap, vpsSnap, plansSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "orders")),
          getDocs(query(collection(db, "vps"), where("status", "==", "active"))),
          getDocs(collection(db, "plans")),
        ]);

        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        const paid   = orders.filter((o) => o.status === "paid");
        setStats({
          users:     usersSnap.size,
          orders:    ordersSnap.size,
          revenue:   paid.reduce((s, o) => s + o.amount, 0),
          activeVPS: vpsSnap.size,
        });
        setRecentOrders(
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
        );

        // Build coupon list from plans collection
        const couponList: CouponEntry[] = [];
        plansSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.couponCode && data.couponDiscount) {
            couponList.push({
              planId:         d.id,
              planName:       data.name || d.id,
              price:          data.price || 0,
              couponCode:     data.couponCode,
              couponDiscount: Number(data.couponDiscount),
            });
          }
        });
        setCoupons(couponList);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards: StatCard[] = [
    { label: "Total Customers", value: stats.users,                          icon: Users,        color: "text-[#0066FF]",  bg: "bg-blue-50",   href: "/admin/users" },
    { label: "Total Orders",    value: stats.orders,                         icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/orders" },
    { label: "Revenue",         value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign,  color: "text-green-600",  bg: "bg-green-50",  href: "/admin/orders" },
    { label: "Active VPS",      value: stats.activeVPS,                      icon: Server,      color: "text-[#FF6B00]",  bg: "bg-orange-50", href: "/admin/vps" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and management.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={card.href} className="block bg-white rounded-[16px] border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${card.bg} rounded-[10px] flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "—" : card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-[#FF6B00] font-medium hover:text-[#E56000]">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center"><div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {["Customer", "Plan", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{order.planName}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₹{order.amount}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={order.status === "paid" ? "success" : order.status === "failed" ? "danger" : "warning"}>
                          {order.status ?? "pending"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Coupon Codes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="text-sm font-semibold text-gray-900">Coupon Codes</h2>
            </div>
            <Link href="/admin/plans" className="flex items-center gap-1 text-xs text-[#FF6B00] font-medium hover:text-[#E56000]">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 flex justify-center"><div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
          ) : coupons.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Tag className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No coupon codes set</p>
              <Link href="/admin/plans" className="text-xs text-[#FF6B00] hover:underline mt-1 inline-block">
                Add one in Plans →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {coupons.map((c) => (
                <div key={c.planId} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">{c.planName}</span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      <Percent className="w-3 h-3" />{c.couponDiscount}% off
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-bold text-gray-900 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-[6px] tracking-wider">
                        {c.couponCode}
                      </span>
                      <CopyBtn text={c.couponCode} />
                    </div>
                    <span className="text-xs text-gray-400">
                      ₹{Math.round(c.price * (1 - c.couponDiscount / 100)).toLocaleString("en-IN")}
                      <span className="line-through ml-1 text-gray-300">₹{c.price.toLocaleString("en-IN")}</span>
                    </span>
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
