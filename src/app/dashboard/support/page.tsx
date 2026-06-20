"use client";

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Ticket } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Plus, X, ChevronRight, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function SupportPage() {
  const { currentUser, userData } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ subject: "", priority: "medium", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "tickets"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"))
      );
      setTickets(snap.docs.map((d) => d.data() as Ticket));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return toast.error("Please fill all fields");
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      await addDoc(collection(db, "tickets"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.name || currentUser.displayName || "User",
        subject: form.subject,
        status: "open",
        priority: form.priority,
        messages: [{
          id: Date.now().toString(),
          senderId: currentUser.uid,
          senderName: userData?.name || currentUser.displayName || "User",
          senderRole: "user",
          message: form.message,
          createdAt: now,
        }],
        createdAt: now,
        updatedAt: now,
      });
      toast.success("Ticket submitted! We'll respond shortly.");
      setShowNew(false);
      setForm({ subject: "", priority: "medium", message: "" });
      fetchTickets();
    } catch {
      toast.error("Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket || !currentUser) return;
    setReplying(true);
    try {
      const now = new Date().toISOString();
      const newMessage = {
        id: Date.now().toString(),
        senderId: currentUser.uid,
        senderName: userData?.name || currentUser.displayName || "User",
        senderRole: "user" as const,
        message: reply,
        createdAt: now,
      };
      const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
      const ticketRef = doc(db, "tickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion(newMessage),
        updatedAt: now,
      });
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, newMessage] });
      setReply("");
      toast.success("Reply sent!");
      fetchTickets();
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setReplying(false);
    }
  };

  const priorityColor: Record<string, "danger" | "warning" | "info"> = { high: "danger", medium: "warning", low: "info" };
  const statusColor: Record<string, "success" | "info" | "warning" | "neutral"> = {
    resolved: "success", in_progress: "info", open: "warning", closed: "neutral"
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-500 mt-1">Open and manage support tickets.</p>
        </div>
        <Button onClick={() => setShowNew(true)} size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Ticket
        </Button>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] shadow-xl w-full max-w-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Open New Ticket</h2>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Subject" placeholder="Briefly describe your issue" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-[12px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea rows={4} placeholder="Describe your issue in detail..." value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-[12px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="submit" loading={submitting} className="flex-1">Submit Ticket</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ticket List */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">My Tickets</h2>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <LifeBuoy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No tickets yet. Open one to get help.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map((ticket) => (
                <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                  className={`w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedTicket?.id === ticket.id ? "bg-orange-50/50" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusColor[ticket.status] || "neutral"}>{ticket.status.replace("_", " ")}</Badge>
                      <Badge variant={priorityColor[ticket.priority] || "info"}>{ticket.priority}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden flex flex-col">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <LifeBuoy className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900 truncate">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusColor[selectedTicket.status] || "neutral"}>{selectedTicket.status.replace("_", " ")}</Badge>
                  <Badge variant={priorityColor[selectedTicket.priority] || "info"}>{selectedTicket.priority} priority</Badge>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
                {selectedTicket.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-[12px] px-4 py-3 ${msg.senderRole === "user" ? "bg-[#FF6B00] text-white" : "bg-gray-50 text-gray-900"}`}>
                      <p className={`text-xs font-medium mb-1 ${msg.senderRole === "user" ? "text-orange-100" : "text-gray-400"}`}>
                        {msg.senderRole === "admin" ? "Support Team" : "You"}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1.5 flex items-center gap-1 ${msg.senderRole === "user" ? "text-orange-200" : "text-gray-400"}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <div className="p-4 border-t border-gray-50 flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..." onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }}}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all" />
                  <Button onClick={handleReply} loading={replying} size="sm">Send</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
