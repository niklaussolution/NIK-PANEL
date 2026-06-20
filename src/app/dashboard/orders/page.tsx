"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Clock, CheckCircle2, XCircle, Eye, AlertCircle,
  Loader2, ExternalLink, FileCheck, Server, RefreshCw,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { UPIOrder, UPIPaymentStatus } from "@/types";

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<UPIPaymentStatus, { label: string; color: string; icon: React.ElementType }> = {
  Pending:        { label: "Pending",        color: "bg-yellow-50 text-yellow-700 border-yellow-200",  icon: Clock },
  "Under Review": { label: "Under Review",   color: "bg-blue-50 text-blue-700 border-blue-200",        icon: AlertCircle },
  Approved:       { label: "Approved",       color: "bg-green-50 text-green-700 border-green-200",      icon: CheckCircle2 },
  Rejected:       { label: "Rejected",       color: "bg-red-50 text-red-700 border-red-200",            icon: XCircle },
};

function StatusBadge({ status }: { status: UPIPaymentStatus }) {
  const cfg  = STATUS_CFG[status] ?? STATUS_CFG.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Screenshot modal ──────────────────────────────────────────────────────────
function ScreenshotModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[16px] overflow-hidden max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-900 text-sm">Payment Screenshot</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
        </div>
        <div className="p-4 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Payment screenshot" className="w-full rounded-[8px] object-contain max-h-[60vh]" />
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" /> Open full image
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: UPIOrder }) {
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [expanded, setExpanded]             = useState(false);

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <>
      {screenshotOpen && order.paymentProof?.screenshotUrl && (
        <ScreenshotModal url={order.paymentProof.screenshotUrl} onClose={() => setScreenshotOpen(false)} />
      )}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-[10px] flex items-center justify-center shrink-0">
              <Server className="w-4.5 h-4.5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{order.planName}</p>
              <p className="text-xs text-gray-400 font-mono">{order.orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <StatusBadge status={order.paymentStatus} />
            <span className="text-sm font-bold text-gray-900">₹{order.amount.toLocaleString("en-IN")}</span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>

        {/* Quick info */}
        <div className="px-5 py-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-500 border-b border-gray-50">
          <span><strong className="text-gray-700">Stack:</strong> {order.os}</span>
          <span><strong className="text-gray-700">Billing:</strong> {order.billingCycle}</span>
          <span><strong className="text-gray-700">Order Status:</strong> {order.orderStatus}</span>
          {order.paymentProof && (
            <span><strong className="text-gray-700">UTR:</strong> {order.paymentProof.utrNumber}</span>
          )}
        </div>

        {/* Actions / expanded details */}
        <div className="px-5 py-3 flex flex-wrap items-center gap-3">
          <button onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-[#0066FF] hover:underline flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {expanded ? "Hide details" : "View details"}
          </button>

          {order.paymentProof?.screenshotUrl && (
            <button onClick={() => setScreenshotOpen(true)}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              View screenshot
            </button>
          )}

          {/* If still pending (no proof submitted), offer to complete */}
          {order.paymentStatus === "Pending" && !order.paymentProof && (
            <a href={`/checkout/upi?order=${order.orderId}`}
              className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Complete payment
            </a>
          )}
        </div>

        {/* Expanded detail panel */}
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                ["Plan ID",    order.planId],
                ["Plan Type",  order.planType],
                ["Stack / OS", order.os],
                ["Amount",     `₹${order.amount.toLocaleString("en-IN")}`],
                ["Method",     order.paymentMethod],
                ["Placed on",  new Date(order.createdAt).toLocaleString("en-IN")],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-xs text-gray-400 block">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>

            {order.paymentProof && (
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment Proof</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-400 block">UTR Number</span>
                    <span className="font-mono font-semibold text-gray-800">{order.paymentProof.utrNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Submitted at</span>
                    <span className="font-medium text-gray-800">{new Date(order.paymentProof.submittedAt).toLocaleString("en-IN")}</span>
                  </div>
                  {order.paymentProof.notes && (
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400 block">Notes</span>
                      <span className="text-gray-700">{order.paymentProof.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-[10px] p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{order.rejectionReason}</p>
                <a href={`/checkout?plan=${order.planId}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline">
                  <RefreshCw className="w-3 h-3" /> Retry with a new order
                </a>
              </div>
            )}

            {order.approvedAt && (
              <div className="bg-green-50 border border-green-100 rounded-[10px] p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Approved</p>
                <p className="text-xs text-green-600">
                  Verified on {new Date(order.approvedAt).toLocaleString("en-IN")} by {order.approvedBy}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders]   = useState<UPIOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          where("paymentMethod", "==", "UPI"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => d.data() as UPIOrder));
      } catch {
        // Index might still be building — fall back to unordered
        try {
          const q2 = query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid),
            where("paymentMethod", "==", "UPI")
          );
          const snap2 = await getDocs(q2);
          setOrders(
            snap2.docs
              .map((d) => d.data() as UPIOrder)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
        } catch (err2) {
          console.error(err2);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const stats = {
    pending:     orders.filter((o) => o.paymentStatus === "Pending").length,
    underReview: orders.filter((o) => o.paymentStatus === "Under Review").length,
    approved:    orders.filter((o) => o.paymentStatus === "Approved").length,
    rejected:    orders.filter((o) => o.paymentStatus === "Rejected").length,
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">Track all your VPS hosting orders and payment status.</p>
        </div>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
            {[
              { label: "Pending",      value: stats.pending,     icon: Clock,         color: "text-yellow-600 bg-yellow-50" },
              { label: "Under Review", value: stats.underReview, icon: AlertCircle,   color: "text-blue-600 bg-blue-50" },
              { label: "Approved",     value: stats.approved,    icon: CheckCircle2,  color: "text-green-600 bg-green-50" },
              { label: "Rejected",     value: stats.rejected,    icon: XCircle,       color: "text-red-600 bg-red-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-[14px] border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-[#FF6B00] animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-7 h-7 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-400 mb-5">Your hosting orders will appear here once you subscribe to a plan.</p>
            <a href="/plans"
              className="inline-flex items-center gap-2 bg-[#FF6B00] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors">
              Browse Plans
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
