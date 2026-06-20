"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";
import { motion } from "framer-motion";
import {
  CreditCard, Download, Plus, RefreshCw,
  CheckCircle, AlertCircle, XCircle, Clock
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import axios from "axios";

interface Subscription {
  id: string;
  planName: string;
  amount: number;
  hostname: string;
  status: string;
  nextBillingAt: string | null;
  activatedAt: string;
  cancelRequestedAt?: string;
  razorpaySubscriptionId: string;
}

function subStatusBadge(status: string) {
  switch (status) {
    case "active":           return <Badge variant="success">Active</Badge>;
    case "past_due":         return <Badge variant="danger">Past Due</Badge>;
    case "cancel_requested": return <Badge variant="warning">Cancels at cycle end</Badge>;
    case "cancelled":        return <Badge variant="neutral">Cancelled</Badge>;
    case "created":          return <Badge variant="info">Pending</Badge>;
    default:                 return <Badge variant="neutral">{status}</Badge>;
  }
}

export default function BillingPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders]             = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchAll = async () => {
      try {
        const [orderSnap, subSnap] = await Promise.all([
          getDocs(query(collection(db, "orders"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "subscriptions"), where("userId", "==", currentUser.uid))),
        ]);
        setOrders(orderSnap.docs.map((d) => d.data() as Order));
        setSubscriptions(subSnap.docs.map((d) => d.data() as Subscription));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser]);

  const handleCancel = async (sub: Subscription) => {
    if (!confirm(`Cancel subscription for ${sub.hostname}? You'll keep access until end of billing cycle.`)) return;
    setCancelling(sub.id);
    try {
      await axios.post("/api/cancel-subscription", {
        subscriptionId: sub.razorpaySubscriptionId,
        userId: currentUser?.uid,
      });
      toast.success("Subscription cancelled. Access continues until end of cycle.");
      setSubscriptions((prev) =>
        prev.map((s) => s.id === sub.id ? { ...s, status: "cancel_requested" } : s)
      );
    } catch {
      toast.error("Failed to cancel. Please contact support.");
    } finally {
      setCancelling(null);
    }
  };

  const totalPaid    = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);
  const activeSubs   = subscriptions.filter((s) => s.status === "active").length;
  const monthlyTotal = subscriptions.filter((s) => s.status === "active").reduce((s, sub) => s + sub.amount, 0);

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subscriptions and payment history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Plans",    value: activeSubs,          icon: CheckCircle, color: "text-green-600",   bg: "bg-green-50"  },
          { label: "Monthly Cost",    value: `₹${monthlyTotal}`,  icon: RefreshCw,   color: "text-[#0066FF]",  bg: "bg-blue-50"   },
          { label: "Total Paid",      value: `₹${totalPaid}`,     icon: CreditCard,  color: "text-[#FF6B00]",  bg: "bg-orange-50" },
          { label: "Total Invoices",  value: orders.filter(o => o.status === "paid").length, icon: Download, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-[16px] border border-gray-100 shadow-card p-5 flex items-center gap-4"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-[10px] flex items-center justify-center flex-shrink-0`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden mb-6"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#0066FF]" />
              <h2 className="text-sm font-semibold text-gray-900">Active Subscriptions</h2>
            </div>
            <Link href="/plans">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add VPS
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{sub.planName}</p>
                    {subStatusBadge(sub.status)}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hostname: <span className="font-mono font-medium text-gray-600">{sub.hostname}</span>
                  </p>
                  {sub.nextBillingAt && sub.status === "active" && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next billing: {new Date(sub.nextBillingAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {sub.status === "past_due" && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Payment failed — update payment method
                    </p>
                  )}
                  {sub.status === "cancel_requested" && (
                    <p className="text-xs text-yellow-600 mt-0.5 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Cancels at end of billing cycle
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{sub.amount}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                </div>

                {(sub.status === "active" || sub.status === "past_due") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={cancelling === sub.id}
                    onClick={() => handleCancel(sub)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Auto-pay info banner */}
          <div className="px-6 py-3 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Payments are automatically debited each month via Razorpay. You will receive an email receipt after every charge.
            </p>
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Payment History</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No payment history yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Plan", "Hostname", "Type", "Amount", "Status", "Date", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{order.planName}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-mono">{order.hostname}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-500">
                        {(order as any).type === "subscription_renewal" ? "Auto-renewal" : "First payment"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">₹{order.amount}</td>
                    <td className="px-5 py-4">
                      <Badge variant={order.status === "paid" ? "success" : order.status === "failed" ? "danger" : "warning"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      {order.status === "paid" && (
                        <button className="flex items-center gap-1 text-xs text-[#0066FF] hover:text-[#0052CC] font-medium">
                          <Download className="w-3 h-3" /> Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {subscriptions.length === 0 && orders.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No active subscriptions</p>
          <p className="text-sm text-gray-400 mt-1">Choose a VPS plan to get started.</p>
          <Link href="/plans">
            <Button className="mt-5 gap-2">
              <Plus className="w-4 h-4" /> View Plans
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
