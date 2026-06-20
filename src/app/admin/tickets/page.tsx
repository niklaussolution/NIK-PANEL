"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Ticket } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Search, Clock, ChevronRight, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "tickets"));
      const data = snap.docs.map((d) => ({ ...(d.data() as Ticket), id: d.id }));
      setTickets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, status: Ticket["status"]) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status, updatedAt: new Date().toISOString() });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
      toast.success("Ticket status updated");
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setReplying(true);
    try {
      const now = new Date().toISOString();
      const newMessage = {
        id: Date.now().toString(),
        senderId: "admin",
        senderName: "Support Team",
        senderRole: "admin" as const,
        message: reply,
        createdAt: now,
      };
      await updateDoc(doc(db, "tickets", selected.id), {
        messages: arrayUnion(newMessage),
        status: "in_progress",
        updatedAt: now,
      });
      const updated = { ...selected, messages: [...selected.messages, newMessage], status: "in_progress" as const };
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === selected.id ? updated : t)));
      setReply("");
      toast.success("Reply sent!");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const priorityColor: Record<string, "danger" | "warning" | "info"> = { high: "danger", medium: "warning", low: "info" };
  const statusColor: Record<string, "success" | "info" | "warning" | "neutral"> = {
    resolved: "success", in_progress: "info", open: "warning", closed: "neutral",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">
          {tickets.filter((t) => t.status === "open").length} open · {tickets.length} total
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Ticket List */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] bg-white text-gray-700">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 flex justify-center"><div className="w-6 h-6 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <LifeBuoy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No tickets found</p>
              </div>
            ) : (
              filtered.map((ticket) => (
                <button key={ticket.id} onClick={() => setSelected(ticket)}
                  className={`w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${selected?.id === ticket.id ? "bg-orange-50/50 border-l-2 border-[#FF6B00]" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{ticket.userEmail}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={statusColor[ticket.status] || "neutral"}>{ticket.status.replace("_", " ")}</Badge>
                      <Badge variant={priorityColor[ticket.priority] || "info"}>{ticket.priority}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Ticket Detail */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden flex flex-col" style={{ minHeight: 500 }}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <LifeBuoy className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Select a ticket to view and reply</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-50 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{selected.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">{selected.userEmail}</p>
                    <span className="text-gray-200">·</span>
                    <Badge variant={statusColor[selected.status] || "neutral"}>{selected.status.replace("_", " ")}</Badge>
                    <Badge variant={priorityColor[selected.priority] || "info"}>{selected.priority}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value as Ticket["status"])}
                    className="text-xs border border-gray-200 rounded-[8px] px-2 py-1.5 outline-none focus:border-[#0066FF] bg-white text-gray-700">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-[12px] px-4 py-3 ${msg.senderRole === "admin" ? "bg-[#FF6B00] text-white" : "bg-gray-50 text-gray-900 border border-gray-100"}`}>
                      <p className={`text-xs font-semibold mb-1 ${msg.senderRole === "admin" ? "text-orange-100" : "text-gray-500"}`}>
                        {msg.senderRole === "admin" ? "Support Team" : msg.senderName}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1.5 flex items-center gap-1 ${msg.senderRole === "admin" ? "text-orange-200" : "text-gray-400"}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selected.status !== "closed" && (
                <div className="p-4 border-t border-gray-50 flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply as Support Team..."
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }}}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all" />
                  <Button onClick={handleReply} loading={replying} size="sm">Reply</Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
