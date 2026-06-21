"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Search, Eye, Loader2,
  Copy, Check, IndianRupee, ShoppingCart, Trash2, AlertTriangle,
  Server, User, Mail, Phone, Calendar, CreditCard, Hash, X as XIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RazorpayOrder {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  os: string;
  status: "pending" | "paid" | "failed";
  type: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  couponCode?: string;
  couponDiscount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {ok ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "pending";
  const cfg: Record<string, string> = {
    paid:    "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    failed:  "bg-red-50 text-red-700 border-red-200",
  };
  const dot: Record<string, string> = {
    paid: "bg-green-400", pending: "bg-yellow-400", failed: "bg-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg[s] ?? cfg.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[s] ?? dot.pending}`} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

// ── Stack badge ───────────────────────────────────────────────────────────────
const STACK_COLOR: Record<string, string> = {
  CyberPanel: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Docker:     "bg-blue-50 text-blue-700 border-blue-200",
  Ubuntu:     "bg-orange-50 text-orange-700 border-orange-200",
};
function StackBadge({ os }: { os: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STACK_COLOR[os] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      <Server className="w-3 h-3" /> {os || "—"}
    </span>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function DetailModal({ order, onClose }: { order: RazorpayOrder; onClose: () => void }) {
  const rows = [
    { icon: User,        label: "Customer",       value: order.customerName },
    { icon: Mail,        label: "Email",           value: order.customerEmail },
    { icon: Phone,       label: "Phone",           value: order.customerPhone },
    { icon: Server,      label: "Stack / OS",      value: order.os || "—" },
    { icon: ShoppingCart,label: "Plan",            value: order.planName },
    { icon: IndianRupee, label: "Amount Paid",     value: `₹${order.amount.toLocaleString("en-IN")}` },
    { icon: Calendar,    label: "Ordered At",      value: fmt(order.createdAt) },
    { icon: Calendar,    label: "Paid At",         value: order.updatedAt ? fmt(order.updatedAt) : "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Order Details</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.razorpayOrderId}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-gray-100">
              <XIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Customer + Plan info */}
          <div className="grid grid-cols-2 gap-3">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-[10px] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 break-all">{value}</p>
              </div>
            ))}
          </div>

          {/* Stack highlighted */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-[10px] border border-gray-100">
            <Server className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-sm font-semibold text-gray-700">Selected Stack:</span>
            <StackBadge os={order.os} />
          </div>

          {/* Payment IDs */}
          <div className="border border-gray-100 rounded-[12px] overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Razorpay Payment Info
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "Order ID",   value: order.razorpayOrderId },
                { label: "Payment ID", value: order.razorpayPaymentId || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-gray-800">
                    {value}
                    {value !== "—" && <CopyBtn text={value} />}
                  </span>
                </div>
              ))}
              {order.couponCode && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-400">Coupon</span>
                  <span className="text-xs font-bold text-green-700">{order.couponCode} (-{order.couponDiscount}%)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Clear data confirm modal ───────────────────────────────────────────────────
function ClearConfirmModal({ onClose, onConfirm, loading }: {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[20px] w-full max-w-sm p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Clear All Data?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          This will permanently delete all orders, payments, VPS records, and subscriptions from Firebase. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 rounded-[10px] border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-[10px] bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? "Clearing…" : "Yes, Clear All"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[20px] w-full max-w-sm p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-center text-gray-900 mb-1">Delete Payment?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          This will permanently remove the payment record for <strong>{name}</strong>. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-[10px] border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-[10px] bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Order row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onView, onDelete }: { order: RazorpayOrder; onView: (o: RazorpayOrder) => void; onDelete: (o: RazorpayOrder) => void }) {
  return (
    <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:border-gray-200 transition-colors">
      <div className="flex-1 min-w-0">
        {/* Top row */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-semibold text-gray-900">{order.customerName}</span>
          <StatusBadge status={order.status} />
          <StackBadge os={order.os} />
        </div>
        {/* Details */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.customerEmail}</span>
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerPhone}</span>
          <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" />{order.planName}</span>
          <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{order.amount.toLocaleString("en-IN")}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(order.createdAt)}</span>
        </div>
        {/* Payment ID if paid */}
        {order.razorpayPaymentId && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
            <Hash className="w-3 h-3" />
            <span className="font-mono">{order.razorpayPaymentId}</span>
            <CopyBtn text={order.razorpayPaymentId} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onView(order)}
          className="text-xs font-medium text-[#0066FF] border border-blue-100 px-3 py-1.5 rounded-[8px] hover:bg-blue-50 transition-colors flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> Full Details
        </button>
        <button
          onClick={() => onDelete(order)}
          className="p-1.5 rounded-[8px] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Date helpers ──────────────────────────────────────────────────────────────
type DateRange = "all" | "today" | "yesterday" | "week" | "month" | "custom";

function getDateBounds(range: DateRange, custom: { from: string; to: string }) {
  const now = new Date();
  const startOf = (d: Date) => { d.setHours(0, 0, 0, 0); return d; };
  const endOf   = (d: Date) => { d.setHours(23, 59, 59, 999); return d; };

  if (range === "today") {
    return { from: startOf(new Date(now)), to: endOf(new Date(now)) };
  }
  if (range === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: startOf(y), to: endOf(new Date(y)) };
  }
  if (range === "week") {
    const f = new Date(now); f.setDate(f.getDate() - 6);
    return { from: startOf(f), to: endOf(new Date(now)) };
  }
  if (range === "month") {
    const f = new Date(now); f.setDate(f.getDate() - 29);
    return { from: startOf(f), to: endOf(new Date(now)) };
  }
  if (range === "custom" && custom.from && custom.to) {
    return { from: startOf(new Date(custom.from)), to: endOf(new Date(custom.to)) };
  }
  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  const [orders, setOrders]       = useState<RazorpayOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"all" | "paid" | "pending">("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [customDate, setCustomDate] = useState({ from: "", to: "" });
  const [selected, setSelected]       = useState<RazorpayOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RazorpayOrder | null>(null);
  const [showClear, setShowClear]     = useState(false);
  const [clearing, setClearing]       = useState(false);

  useEffect(() => {
    let q;
    try {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    } catch {
      q = collection(db, "orders");
    }
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RazorpayOrder)));
      setLoading(false);
    }, () => {
      // fallback without orderBy
      const unsub2 = onSnapshot(collection(db, "orders"), (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RazorpayOrder));
        setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      });
      return unsub2;
    });
    return () => unsub();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteDoc(doc(db, "orders", deleteTarget.id));
      toast.success("Payment record deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await axios.post("/api/admin/clear-data");
      toast.success("All data cleared successfully.");
      setShowClear(false);
    } catch {
      toast.error("Failed to clear data. Check server logs.");
    } finally {
      setClearing(false);
    }
  };

  // Stats
  const paid    = orders.filter((o) => o.status === "paid");
  const pending = orders.filter((o) => o.status === "pending");
  const revenue = paid.reduce((s, o) => s + o.amount, 0);

  const bounds = getDateBounds(dateRange, customDate);

  const visible = orders.filter((o) => {
    if (filter === "paid"    && o.status !== "paid")    return false;
    if (filter === "pending" && o.status !== "pending") return false;
    if (bounds) {
      const t = new Date(o.createdAt).getTime();
      if (t < bounds.from.getTime() || t > bounds.to.getTime()) return false;
    }
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(s) ||
      o.customerEmail?.toLowerCase().includes(s) ||
      o.customerPhone?.includes(s) ||
      o.planName?.toLowerCase().includes(s) ||
      o.razorpayOrderId?.toLowerCase().includes(s) ||
      o.razorpayPaymentId?.toLowerCase().includes(s) ||
      o.os?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 sm:p-8">
      <AnimatePresence>
        {selected      && <DetailModal key="detail" order={selected} onClose={() => setSelected(null)} />}
        {deleteTarget  && (
          <DeleteModal key="delete"
            name={deleteTarget.customerName || deleteTarget.customerEmail}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
        {showClear && (
          <ClearConfirmModal key="clear"
            onClose={() => setShowClear(false)}
            onConfirm={handleClearAll}
            loading={clearing}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders & Payments</h1>
            <p className="text-sm text-gray-400 mt-1">All customer orders with payment status, stack choice, and full details.</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-5 h-5 text-[#FF6B00] animate-spin" />}
            <button
              onClick={() => setShowClear(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded-[10px] hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Data
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {[
            { label: "Total Orders",  value: orders.length,                                   icon: ShoppingCart, color: "text-gray-600 bg-gray-50" },
            { label: "Paid",          value: paid.length,                                      icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Pending",       value: pending.length,                                   icon: Clock,        color: "text-yellow-600 bg-yellow-50" },
            { label: "Total Revenue", value: `₹${revenue.toLocaleString("en-IN")}`,           icon: IndianRupee,  color: "text-purple-600 bg-purple-50" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[14px] border border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-4 mb-5 space-y-3">
          {/* Row 1 — status + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "paid", "pending"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-colors capitalize ${filter === f ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f === "all" ? "All Orders" : f}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search name, email, phone, plan, payment ID, stack…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
          </div>

          {/* Row 2 — date filter */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-50">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            {([
              { key: "all",       label: "All Time" },
              { key: "today",     label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "week",      label: "Last 7 Days" },
              { key: "month",     label: "Last 30 Days" },
              { key: "custom",    label: "Custom" },
            ] as { key: DateRange; label: string }[]).map(({ key, label }) => (
              <button key={key} onClick={() => setDateRange(key)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-[8px] transition-colors ${dateRange === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {label}
              </button>
            ))}
            {dateRange === "custom" && (
              <div className="flex items-center gap-2 ml-1">
                <input type="date" value={customDate.from}
                  onChange={(e) => setCustomDate((p) => ({ ...p, from: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-[8px] px-2 py-1 focus:outline-none focus:border-[#FF6B00]" />
                <span className="text-xs text-gray-400">to</span>
                <input type="date" value={customDate.to}
                  onChange={(e) => setCustomDate((p) => ({ ...p, to: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-[8px] px-2 py-1 focus:outline-none focus:border-[#FF6B00]" />
              </div>
            )}
            {dateRange !== "all" && (
              <span className="text-xs text-gray-400 ml-auto">
                {visible.length} result{visible.length !== 1 ? "s" : ""}
              </span>
            )}
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
              {search ? "No orders match your search." : "No orders yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((order) => (
              <OrderRow key={order.id} order={order} onView={setSelected} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
