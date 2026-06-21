"use client";

import React, { useEffect, useState } from "react";
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, updateDoc, orderBy, query, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Terminal, Plus, Trash2, GripVertical, Loader2, Save, X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Command {
  id: string;
  label: string;
  command: string;
  description: string;
  order: number;
}

const empty = { label: "", command: "", description: "" };

export default function AdminCommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "commands"), orderBy("order", "asc"));
    return onSnapshot(q, (snap) => {
      setCommands(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Command)));
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.label.trim() || !form.command.trim()) {
      toast.error("Label and command are required");
      return;
    }
    setAdding(true);
    try {
      await addDoc(collection(db, "commands"), {
        label: form.label.trim(),
        command: form.command.trim(),
        description: form.description.trim(),
        order: commands.length,
      });
      setForm(empty);
      setShowForm(false);
      toast.success("Command added");
    } catch {
      toast.error("Failed to add command");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "commands", id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const handleReorder = (reordered: Command[]) => {
    setCommands(reordered);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      commands.forEach((cmd, i) => {
        batch.update(doc(db, "commands", cmd.id), { order: i });
      });
      await batch.commit();
      toast.success("Order saved");
    } catch {
      toast.error("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the commands shown on the public homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveOrder}
            disabled={saving || commands.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save order
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#FF6B00] rounded-[10px] hover:bg-[#e55f00] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add command
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-gray-200 rounded-[16px] p-5 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">New command</h3>
              <button onClick={() => { setShowForm(false); setForm(empty); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Label <span className="text-red-400">*</span></label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Install Docker"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[9px] outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Command <span className="text-red-400">*</span></label>
                <input
                  value={form.command}
                  onChange={(e) => setForm((f) => ({ ...f, command: e.target.value }))}
                  placeholder="e.g. curl -sSL https://get.docker.com | sh"
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-[9px] outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Description <span className="text-gray-400">(optional)</span></label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description shown below the command"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[9px] outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { setShowForm(false); setForm(empty); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-[9px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] rounded-[9px] hover:bg-[#e55f00] disabled:opacity-60 transition-colors"
                >
                  {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : commands.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[16px] border border-gray-100">
          <Terminal className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No commands yet. Add one above.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5" />
            Drag rows to reorder, then click <strong>Save order</strong>
          </p>
          <Reorder.Group axis="y" values={commands} onReorder={handleReorder} className="space-y-2">
            {commands.map((cmd) => (
              <Reorder.Item key={cmd.id} value={cmd}>
                <div className="bg-white border border-gray-100 rounded-[14px] px-4 py-3.5 flex items-center gap-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-200 transition-colors">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wide">{cmd.label}</span>
                    <code className="block text-sm text-gray-700 font-mono truncate mt-0.5">{cmd.command}</code>
                    {cmd.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{cmd.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteId(cmd.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-[7px] hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-1">Delete command?</h3>
              <p className="text-sm text-gray-500 mb-5">This will remove it from the public homepage immediately.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-[9px] transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-[9px] transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
