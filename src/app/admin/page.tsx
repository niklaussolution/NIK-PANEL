"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign, Server, TrendingUp, ArrowUpRight } from "lucide-react";
import { Order, VPS, Ticket } from "@/types";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: string;
  href: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, activeVPS: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [usersSnap, ordersSnap, vpsSnap, ticketsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "orders")),
          getDocs(query(collection(db, "vps"), where("status", "==", "active"))),
          getDocs(collection(db, "tickets")),
        ]);
        const orders = ordersSnap.docs.map((d) => d.data() as Order);
        const paidOrders = orders.filter((o) => o.status === "paid");
        const revenue = paidOrders.reduce((s, o) => s + o.amount, 0);
        setStats({
          users: usersSnap.size,
          orders: ordersSnap.size,
          revenue,
          activeVPS: vpsSnap.size,
        });
        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6));
        setRecentTickets(ticketsSnap.docs.map((d) => d.data() as Ticket).filter((t) => t.status === "open").slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statCards: StatCard[] = [
    { label: "Total Customers", value: stats.users, icon: Users, color: "text-[#0066FF]", bg: "bg-blue-50", trend: "+12%", href: "/admin/users" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-50", trend: "+8%", href: "/admin/orders" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50", trend: "+23%", href: "/admin/orders" },
    { label: "Active VPS", value: stats.activeVPS, icon: Server, color: "text-[#FF6B00]", bg: "bg-orange-50", trend: "+5%", href: "/admin/vps" },
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
                {card.trend && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />{card.trend}
                  </span>
                )}
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
                          {order.status}
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

        {/* Open Tickets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Open Tickets</h2>
            <Link href="/admin/tickets" className="flex items-center gap-1 text-xs text-[#FF6B00] font-medium hover:text-[#E56000]">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 flex justify-center"><div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
          ) : recentTickets.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No open tickets</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentTickets.map((ticket) => (
                <Link key={ticket.id} href="/admin/tickets" className="block px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{ticket.userEmail}</p>
                    <Badge variant={ticket.priority === "high" ? "danger" : ticket.priority === "medium" ? "warning" : "info"}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
