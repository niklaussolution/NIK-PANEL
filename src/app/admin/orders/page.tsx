"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types";
import { motion } from "framer-motion";
import { ShoppingCart, Search, RefreshCw, DollarSign } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.planName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total · ₹{totalRevenue.toLocaleString()} revenue</p>
        </div>
        <button onClick={fetchOrders} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-[10px] transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-green-600", bg: "bg-green-50" },
          { label: "Paid", value: orders.filter((o) => o.status === "paid").length, color: "text-[#0066FF]", bg: "bg-blue-50" },
          { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Failed", value: orders.filter((o) => o.status === "failed").length, color: "text-red-600", bg: "bg-red-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-[14px] border border-gray-100 shadow-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-[9px] flex items-center justify-center`}>
              <DollarSign className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{loading ? "—" : s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] transition-all bg-white text-gray-700">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Customer", "Plan", "Hostname", "Amount", "Status", "Payment ID", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{order.planName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{order.hostname}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₹{order.amount}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={order.status === "paid" ? "success" : order.status === "failed" ? "danger" : "warning"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                      {order.razorpayPaymentId ? order.razorpayPaymentId.slice(0, 14) + "..." : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
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
