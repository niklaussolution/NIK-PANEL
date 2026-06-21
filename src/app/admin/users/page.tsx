"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

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
        <h3 className="text-base font-bold text-center text-gray-900 mb-1">Delete User?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          This will permanently remove <strong>{name}</strong> from the database. This cannot be undone.
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as User)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteDoc(doc(db, "users", deleteTarget.id));
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name || "User"} deleted`);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            name={deleteTarget.name || deleteTarget.email || "this user"}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} registered customers</p>
        </div>
        <button onClick={fetchUsers} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-[10px] transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[16px] border border-gray-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[10px] outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{search ? "No users match your search" : "No users registered yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["User", "Email", "Phone", "Role", "Joined", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(user.name || "U")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{user.email}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{user.phone || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === "admin" ? "danger" : "neutral"}>{user.role || "user"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {user.createdAt
                        ? (() => {
                            const v = user.createdAt as unknown;
                            const d = v && typeof v === "object" && "toDate" in v
                              ? (v as { toDate: () => Date }).toDate()
                              : new Date(user.createdAt as string);
                            return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
                          })()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[7px] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
