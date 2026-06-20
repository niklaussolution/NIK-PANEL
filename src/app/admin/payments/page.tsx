"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, AlertCircle, Search,
  Eye, Filter, Loader2, ExternalLink, Copy, Check,
  IndianRupee, ShoppingCart, TrendingUp, RefreshCw,
  X as XIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, query, where, onSnapshot, orderBy,
  doc, updateDoc, addDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { UPIOrder, UPIPaymentStatus } from "@/types";
import { createTransaction, createNotification } from "@/lib/orders";
import Textarea from "@/components/ui/Textarea";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<UPIPaymentStatus, { label: string; dot: string; badge: string }> = {
  Pending:        { label: "Pending",        dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "Under Review": { label: "Under Review",   dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  Approved:       { label: "Approved",       dot: "bg-green-400",  badge: "bg-green-50 text-green-700 border-green-200" },
  Rejected:       { label: "Rejected",       dot: "bg-red-400",    badge: "bg-red-50 text-red-700 border-red-200" },
};

function StatusBadge({ status }: { status: UPIPaymentStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
      {ok ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Screenshot modal ──────────────────────────────────────────────────────────
function ScreenshotModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[16px] overflow-hidden max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <span className="font-semibold text-sm">Payment Screenshot</span>
          <button onClick={onClose}><XIcon className="w-4 h-4 text-gray-500" /></button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Payment proof" className="w-full max-h-[70vh] object-contain bg-gray-50" />
        <div className="px-5 py-3 border-t text-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Full size
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ── Approve modal ─────────────────────────────────────────────────────────────
function ApproveModal({ order, adminEmail, onClose, onDone }: {
  order: UPIOrder;
  adminEmail: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    try {
      // 1. Update order
      await updateDoc(doc(db, "orders", order.orderId), {
        paymentStatus: "Approved",
        orderStatus:   "Active",
        approvedBy:    adminEmail,
        approvedAt:    now,
        updatedAt:     now,
      });

      // 2. Create transaction record
      await createTransaction({
        orderId:       order.orderId,
        userId:        order.userId,
        amount:        order.amount,
        utrNumber:     order.paymentProof?.utrNumber || "",
        paymentMethod: "UPI",
        approvedBy:    adminEmail,
        approvedAt:    now,
      });

      // 3. Notify user
      await createNotification({
        userId:    order.userId,
        title:     "Payment Verified ✓",
        message:   `Payment verified successfully. Your hosting order (${order.orderId}) is now active. Your VPS will be provisioned shortly.`,
        type:      "payment_approved",
        orderId:   order.orderId,
        read:      false,
        createdAt: now,
      });

      onDone();
    } catch (err) {
      console.error(err);
      alert("Failed to approve. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[20px] w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 mb-1">Approve Payment</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          Confirm approval for order <strong>{order.orderId}</strong> — ₹{order.amount.toLocaleString("en-IN")} from <strong>{order.userName}</strong>.
        </p>
        <div className="bg-gray-50 rounded-[12px] p-4 text-sm mb-5 space-y-1">
          <div className="flex justify-between"><span className="text-gray-400">UTR</span><span className="font-mono font-semibold">{order.paymentProof?.utrNumber || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="font-semibold">{order.planName}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-bold text-green-700">₹{order.amount.toLocaleString("en-IN")}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-[10px] border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleApprove} disabled={loading}
            className="flex-1 py-2.5 rounded-[10px] bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {loading ? "Approving…" : "Approve"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Reject modal ──────────────────────────────────────────────────────────────
function RejectModal({ order, adminEmail, onClose, onDone }: {
  order: UPIOrder;
  adminEmail: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) { setError("Please provide a rejection reason."); return; }
    setLoading(true);
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "orders", order.orderId), {
        paymentStatus:   "Rejected",
        orderStatus:     "Cancelled",
        rejectionReason: reason.trim(),
        approvedBy:      adminEmail,
        updatedAt:       now,
      });

      await createNotification({
        userId:    order.userId,
        title:     "Payment Verification Failed",
        message:   `Payment verification failed for order ${order.orderId}. Reason: ${reason.trim()}. Please contact support or retry with a new order.`,
        type:      "payment_rejected",
        orderId:   order.orderId,
        read:      false,
        createdAt: now,
      });

      onDone();
    } catch (err) {
      console.error(err);
      alert("Failed to reject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[20px] w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 mb-1">Reject Payment</h3>
        <p className="text-sm text-gray-500 text-center mb-4">Order <strong>{order.orderId}</strong> — provide a reason for rejection.</p>
        <Textarea label="Rejection Reason" placeholder="e.g. UTR number doesn't match, wrong amount paid, screenshot unclear…"
          value={reason} error={error} onChange={(e) => { setReason(e.target.value); setError(""); }} rows={3} />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-[10px] border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleReject} disabled={loading}
            className="flex-1 py-2.5 rounded-[10px] bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {loading ? "Rejecting…" : "Reject Payment"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Order row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onApprove, onReject }: {
  order: UPIOrder;
  onApprove: (o: UPIOrder) => void;
  onReject:  (o: UPIOrder) => void;
}) {
  const [expanded, setExpanded]       = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const canAct = order.paymentStatus === "Under Review" || order.paymentStatus === "Pending";

  return (
    <>
      {screenshotUrl && <ScreenshotModal url={screenshotUrl} onClose={() => setScreenshotUrl(null)} />}
      <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Main row */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
              <span><strong className="text-gray-700">{order.userName}</strong> · {order.email}</span>
              <span>{order.planName} — ₹{order.amount.toLocaleString("en-IN")}</span>
              <span>{date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setExpanded((v) => !v)}
              className="text-xs font-medium text-[#0066FF] border border-blue-100 px-3 py-1.5 rounded-[8px] hover:bg-blue-50 transition-colors flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {expanded ? "Less" : "Details"}
            </button>

            {canAct && (
              <>
                <button onClick={() => onApprove(order)}
                  className="text-xs font-semibold text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-[8px] hover:bg-green-100 transition-colors flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => onReject(order)}
                  className="text-xs font-semibold text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-[8px] hover:bg-red-100 transition-colors flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5 space-y-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {[
                ["Customer",   order.userName],
                ["Email",      order.email],
                ["Phone",      order.phone],
                ["Plan",       order.planName],
                ["Stack",      order.os],
                ["Billing",    order.billingCycle],
                ["Amount",     `₹${order.amount.toLocaleString("en-IN")}`],
                ["Method",     order.paymentMethod],
                ["Order Status", order.orderStatus],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-xs text-gray-400 block">{k}</span>
                  <span className="font-medium text-gray-800 break-all">{v}</span>
                </div>
              ))}
            </div>

            {order.paymentProof && (
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment Proof</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <span className="text-xs text-gray-400 block">UTR Number</span>
                    <span className="font-mono font-bold text-gray-900 flex items-center gap-1">
                      {order.paymentProof.utrNumber}
                      <CopyBtn text={order.paymentProof.utrNumber} />
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Submitted</span>
                    <span className="font-medium text-gray-800">{new Date(order.paymentProof.submittedAt).toLocaleString("en-IN")}</span>
                  </div>
                  {order.paymentProof.notes && (
                    <div>
                      <span className="text-xs text-gray-400 block">Notes</span>
                      <span className="text-gray-700">{order.paymentProof.notes}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setScreenshotUrl(order.paymentProof!.screenshotUrl)}
                  className="mt-2 text-xs font-semibold text-[#0066FF] hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> View Screenshot
                </button>
              </div>
            )}

            {order.rejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-[10px] p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{order.rejectionReason}</p>
              </div>
            )}

            {order.approvedAt && (
              <div className="bg-green-50 border border-green-100 rounded-[10px] p-3 text-xs text-green-700">
                Approved on {new Date(order.approvedAt).toLocaleString("en-IN")} by {order.approvedBy}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type FilterStatus = "All" | UPIPaymentStatus;

export default function AdminPaymentsPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders]     = useState<UPIOrder[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<FilterStatus>("All");
  const [approveTarget, setApproveTarget] = useState<UPIOrder | null>(null);
  const [rejectTarget,  setRejectTarget]  = useState<UPIOrder | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("paymentMethod", "==", "UPI"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as UPIOrder));
      setLoading(false);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      // fallback without orderBy if index is building
      const q2 = query(collection(db, "orders"), where("paymentMethod", "==", "UPI"));
      onSnapshot(q2, (snap2) => {
        setOrders(
          snap2.docs
            .map((d) => d.data() as UPIOrder)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        setLoading(false);
      });
    });

    return () => unsub();
  }, []);

  // Derived stats
  const stats = {
    pending:     orders.filter((o) => o.paymentStatus === "Pending").length,
    underReview: orders.filter((o) => o.paymentStatus === "Under Review").length,
    approved:    orders.filter((o) => o.paymentStatus === "Approved").length,
    rejected:    orders.filter((o) => o.paymentStatus === "Rejected").length,
    revenue:     orders.filter((o) => o.paymentStatus === "Approved").reduce((s, o) => s + o.amount, 0),
  };

  // Filter + search
  const visible = orders.filter((o) => {
    if (filter !== "All" && o.paymentStatus !== filter) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(s) ||
      o.userName.toLowerCase().includes(s) ||
      o.email.toLowerCase().includes(s) ||
      (o.paymentProof?.utrNumber.toLowerCase().includes(s) ?? false)
    );
  });

  const adminEmail = currentUser?.email || "admin";

  const FILTERS: FilterStatus[] = ["All", "Pending", "Under Review", "Approved", "Rejected"];

  return (
    <div className="p-6 sm:p-8">
      <AnimatePresence>
        {approveTarget && (
          <ApproveModal key="approve" order={approveTarget} adminEmail={adminEmail}
            onClose={() => setApproveTarget(null)} onDone={() => setApproveTarget(null)} />
        )}
        {rejectTarget && (
          <RejectModal key="reject" order={rejectTarget} adminEmail={adminEmail}
            onClose={() => setRejectTarget(null)} onDone={() => setRejectTarget(null)} />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
            <p className="text-sm text-gray-400 mt-1">Review and approve UPI payment proofs from customers.</p>
          </div>
          {loading && <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin mt-1" />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
          {[
            { label: "Pending",      value: stats.pending,     icon: Clock,        color: "text-yellow-600 bg-yellow-50" },
            { label: "Under Review", value: stats.underReview, icon: AlertCircle,  color: "text-blue-600 bg-blue-50" },
            { label: "Approved",     value: stats.approved,    icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Rejected",     value: stats.rejected,    icon: XCircle,      color: "text-red-600 bg-red-50" },
            { label: "Revenue",      value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-purple-600 bg-purple-50" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[14px] border border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter + Search bar */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-colors ${filter === f ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f}
                {f === "Pending" && stats.pending > 0 && (
                  <span className="ml-1 bg-yellow-400 text-white text-xs rounded-full px-1.5 py-0.5">{stats.pending}</span>
                )}
                {f === "Under Review" && stats.underReview > 0 && (
                  <span className="ml-1 bg-blue-400 text-white text-xs rounded-full px-1.5 py-0.5">{stats.underReview}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search order ID, name, email or UTR…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20" />
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-[#FF6B00] animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {search ? "No orders match your search." : filter !== "All" ? `No ${filter} orders.` : "No UPI orders yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((order) => (
              <OrderRow
                key={order.orderId}
                order={order}
                onApprove={setApproveTarget}
                onReject={setRejectTarget}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
