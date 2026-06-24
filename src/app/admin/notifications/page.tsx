"use client";

import React, { useEffect, useState } from "react";
import {
  collection, onSnapshot, orderBy, query,
  updateDoc, doc, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShoppingCart, CheckCircle2, Mail, Phone,
  IndianRupee, Check, CheckCheck, User,
} from "lucide-react";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: "new_order" | "payment_success";
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  planName: string;
  amount: number;
  orderId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  read: boolean;
  createdAt: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
      setLoading(false);
    });
  }, []);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.read);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach((n) => batch.update(doc(db, "notifications", n.id), { read: true }));
    await batch.commit();
    toast.success("All marked as read");
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-2 rounded-[10px] hover:bg-gray-50 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[16px] border border-gray-100">
          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifs.map((n) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-[14px] border shadow-sm p-4 flex gap-4 transition-colors ${n.read ? "border-gray-100" : "border-[#FF6B00]/30 bg-orange-50/30"}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === "payment_success" ? "bg-green-100" : "bg-orange-100"}`}>
                  {n.type === "payment_success"
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <ShoppingCart className="w-5 h-5 text-[#FF6B00]" />}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wide ${n.type === "payment_success" ? "text-green-600" : "text-[#FF6B00]"}`}>
                        {n.type === "payment_success" ? "Payment Confirmed" : "New Purchase Attempt"}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{fmt(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)}
                        className="flex-shrink-0 p-1.5 rounded-[7px] text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Mark as read">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Customer details */}
                  <div className="bg-gray-50 rounded-[10px] p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-gray-900">{n.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span>{n.customerEmail}</span>
                    </div>
                    {n.customerPhone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span>{n.customerPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-700">{n.planName}</span>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-green-700">
                        <IndianRupee className="w-3 h-3" />₹{n.amount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
